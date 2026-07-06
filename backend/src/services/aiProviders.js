/**
 * Provider-agnostic AI layer for the Product Repurposing module.
 *
 * Two capabilities:
 *  - LLM structured generation (product copy, SEO, risk) from a screenshot + source info
 *  - Image generation/editing from a reference screenshot
 *
 * Providers are resolved from admin-editable settings (settings collection)
 * with environment variables as the default. API keys never leave the server;
 * the settings API masks them.
 *
 * Supported today:
 *  LLM:   gemini (default, reuses GEMINI_API_KEY), openai-compatible
 *  Image: gemini (default, image-capable Gemini model), openai (gpt-image-1 edits)
 * Other providers (replicate, stability, leonardo) are accepted in settings but
 * return a clear "not yet supported" error instead of failing silently.
 */

const SETTINGS_COLLECTION = 'settings';
const AI_SETTINGS_KEY = 'repurposing_ai_settings';

export const DEFAULT_AI_SETTINGS = {
  llmProvider: 'gemini',
  llmModel: 'gemini-2.5-flash',
  llmApiKey: '',
  llmBaseUrl: '',
  imageProvider: 'gemini',
  imageModel: 'gemini-2.5-flash-image',
  imageApiKey: '',
  imageBaseUrl: '',
  imageOutputSize: '1024x1024',
  imageOutputFormat: 'png',
  maxImageAttempts: 3,
  autoGenerateImage: true,
  requireImageApproval: true,
  maxBatchSize: 10,
};

export async function getAiSettings(db) {
  const stored = await db
    .collection(SETTINGS_COLLECTION)
    .findOne({ key: AI_SETTINGS_KEY });
  return { ...DEFAULT_AI_SETTINGS, ...(stored?.value || {}) };
}

export async function saveAiSettings(db, patch) {
  const current = await getAiSettings(db);
  const next = { ...current };
  for (const [key, value] of Object.entries(patch || {})) {
    if (!(key in DEFAULT_AI_SETTINGS)) continue;
    // Masked keys come back from the UI as '••••…'; ignore them so the stored
    // secret is only replaced when the admin actually types a new one.
    if (key.endsWith('ApiKey') && typeof value === 'string' && value.includes('•')) continue;
    next[key] = value;
  }
  await db.collection(SETTINGS_COLLECTION).updateOne(
    { key: AI_SETTINGS_KEY },
    { $set: { key: AI_SETTINGS_KEY, value: next, updatedAt: new Date() } },
    { upsert: true }
  );
  return next;
}

const maskKey = (key) => (key ? `••••${key.slice(-4)}` : '');

/** Settings shaped for the admin UI — secrets masked, availability flags included. */
export function toPublicAiSettings(settings) {
  const llmKey = resolveLlmApiKey(settings);
  const imageKey = resolveImageApiKey(settings);
  return {
    ...settings,
    llmApiKey: maskKey(settings.llmApiKey),
    imageApiKey: maskKey(settings.imageApiKey),
    llmConfigured: Boolean(llmKey),
    imageConfigured: Boolean(imageKey),
    llmKeySource: settings.llmApiKey ? 'settings' : (resolveEnvLlmKey(settings.llmProvider) ? 'environment' : 'missing'),
    imageKeySource: settings.imageApiKey ? 'settings' : (resolveEnvImageKey(settings.imageProvider) ? 'environment' : 'missing'),
  };
}

function resolveEnvLlmKey(provider) {
  if (process.env.LLM_API_KEY) return process.env.LLM_API_KEY;
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (provider === 'openai' && process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  return '';
}

function resolveEnvImageKey(provider) {
  if (process.env.IMAGE_MODEL_API_KEY) return process.env.IMAGE_MODEL_API_KEY;
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (provider === 'openai' && process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  return '';
}

export function resolveLlmApiKey(settings) {
  return settings.llmApiKey || resolveEnvLlmKey(settings.llmProvider);
}

export function resolveImageApiKey(settings) {
  return settings.imageApiKey || resolveEnvImageKey(settings.imageProvider);
}

export class AiConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AiConfigError';
    this.statusCode = 422;
  }
}

/* ------------------------------------------------------------------ */
/* LLM: structured product understanding                               */
/* ------------------------------------------------------------------ */

function extractJson(text) {
  if (!text) throw new Error('Empty AI response');
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('AI response was not valid JSON');
  }
}

async function callGeminiLlm({ apiKey, model, prompt, imageBase64, imageMimeType }) {
  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: imageMimeType || 'image/png', data: imageBase64 } });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const err = new Error(`LLM request failed (${response.status})`);
    err.providerDetail = body.slice(0, 500);
    err.statusCode = response.status === 401 || response.status === 403 ? 422 : 502;
    throw err;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  return extractJson(text);
}

async function callOpenAiCompatibleLlm({ apiKey, baseUrl, model, prompt, imageBase64, imageMimeType }) {
  const content = [{ type: 'text', text: prompt }];
  if (imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${imageMimeType || 'image/png'};base64,${imageBase64}` },
    });
  }

  const response = await fetch(`${(baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const err = new Error(`LLM request failed (${response.status})`);
    err.providerDetail = body.slice(0, 500);
    err.statusCode = response.status === 401 ? 422 : 502;
    throw err;
  }

  const data = await response.json();
  return extractJson(data?.choices?.[0]?.message?.content || '');
}

/**
 * Send a screenshot + source info to the configured LLM and get structured
 * product data back. `prompt` must instruct the model to return JSON.
 */
export async function generateStructuredFromImage(settings, { prompt, imageBase64, imageMimeType }) {
  const apiKey = resolveLlmApiKey(settings);
  if (!apiKey) {
    throw new AiConfigError(
      'No LLM API key configured. Add one in AI Settings or set LLM_API_KEY / GEMINI_API_KEY in the backend environment.'
    );
  }

  const provider = settings.llmProvider || 'gemini';
  if (provider === 'gemini') {
    return callGeminiLlm({ apiKey, model: settings.llmModel || 'gemini-2.5-flash', prompt, imageBase64, imageMimeType });
  }
  if (provider === 'openai' || provider === 'openai-compatible') {
    return callOpenAiCompatibleLlm({
      apiKey,
      baseUrl: settings.llmBaseUrl,
      model: settings.llmModel || 'gpt-4o-mini',
      prompt,
      imageBase64,
      imageMimeType,
    });
  }
  throw new AiConfigError(`LLM provider "${provider}" is not supported yet. Use "gemini" or "openai".`);
}

/* ------------------------------------------------------------------ */
/* Image generation / editing                                          */
/* ------------------------------------------------------------------ */

async function generateImageWithGemini({ apiKey, model, prompt, imageBase64, imageMimeType }) {
  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: imageMimeType || 'image/png', data: imageBase64 } });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    let message = `Image generation failed (${response.status})`;
    if (response.status === 429 && /free_tier|quota/i.test(body)) {
      message =
        'The connected Gemini key has no image-generation quota (image models need a billed Gemini plan). Enable billing on the key, or switch the image provider to OpenAI in AI Settings, or upload an image manually.';
    }
    const err = new Error(message);
    err.providerDetail = body.slice(0, 500);
    err.statusCode = response.status === 401 || response.status === 403 ? 422 : 502;
    throw err;
  }

  const data = await response.json();
  const partsOut = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = partsOut.find((p) => p.inlineData?.data || p.inline_data?.data);
  const inline = imagePart?.inlineData || imagePart?.inline_data;
  if (!inline?.data) {
    const textOut = partsOut.map((p) => p.text || '').join(' ').slice(0, 300);
    const err = new Error(
      textOut
        ? `Image model returned no image: ${textOut}`
        : 'Image model returned no image. Check that the configured model supports image output.'
    );
    err.statusCode = 502;
    throw err;
  }
  return { base64: inline.data, mimeType: inline.mimeType || inline.mime_type || 'image/png' };
}

async function generateImageWithOpenAi({ apiKey, baseUrl, model, prompt, imageBase64, imageMimeType, size }) {
  const root = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  let response;

  if (imageBase64) {
    const form = new FormData();
    form.append('model', model || 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('size', size || '1024x1024');
    const bytes = Buffer.from(imageBase64, 'base64');
    form.append('image', new Blob([bytes], { type: imageMimeType || 'image/png' }), 'reference.png');
    response = await fetch(`${root}/images/edits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } else {
    response = await fetch(`${root}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: model || 'gpt-image-1', prompt, size: size || '1024x1024' }),
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const err = new Error(`Image generation failed (${response.status})`);
    err.providerDetail = body.slice(0, 500);
    err.statusCode = response.status === 401 ? 422 : 502;
    throw err;
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    const err = new Error('Image model returned no image data');
    err.statusCode = 502;
    throw err;
  }
  return { base64: b64, mimeType: 'image/png' };
}

/**
 * Regenerate a product image from a reference screenshot using the configured
 * image provider. Returns { base64, mimeType }.
 */
export async function generateImageFromReference(settings, { prompt, imageBase64, imageMimeType }) {
  const apiKey = resolveImageApiKey(settings);
  if (!apiKey) {
    throw new AiConfigError(
      'No image model API key configured. Add one in AI Settings or set IMAGE_MODEL_API_KEY in the backend environment.'
    );
  }

  const provider = settings.imageProvider || 'gemini';
  if (provider === 'gemini') {
    return generateImageWithGemini({
      apiKey,
      model: settings.imageModel || 'gemini-2.5-flash-image',
      prompt,
      imageBase64,
      imageMimeType,
    });
  }
  if (provider === 'openai') {
    return generateImageWithOpenAi({
      apiKey,
      baseUrl: settings.imageBaseUrl,
      model: settings.imageModel,
      prompt,
      imageBase64,
      imageMimeType,
      size: settings.imageOutputSize,
    });
  }
  throw new AiConfigError(
    `Image provider "${provider}" is not supported yet. Use "gemini" or "openai" for now — the settings model is provider-agnostic so more can be added.`
  );
}
