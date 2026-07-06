import { adminAuth } from '../middleware/adminAuth.js';
import { uploadMedia } from '../services/adminService.js';
import {
  getAiSettings,
  saveAiSettings,
  toPublicAiSettings,
} from '../services/aiProviders.js';
import {
  createDraft,
  getDraft,
  updateDraft,
  deleteDraft,
  listDrafts,
  generateCopyForDraft,
  generateImageForDraft,
  publishDraft,
  getPricingSettings,
  savePricingSettings,
  calculatePricing,
  assessRisk,
  getSourceInfoForOrder,
  setOrderFulfilmentStatus,
  ADMIN_FULFILMENT_STATUSES,
} from '../services/repurposingService.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function sendError(reply, error, fallback) {
  const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
  const message = statusCode === 500 ? fallback : error.message;
  return reply.status(statusCode).send({ error: true, message });
}

async function readUploadedImage(request) {
  const data = await request.file();
  if (!data) return { file: null, fields: {} };

  const buffer = await data.toBuffer();
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw Object.assign(new Error('Image is too large (max 10MB)'), { statusCode: 413 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(data.mimetype)) {
    throw Object.assign(new Error('Unsupported image type. Use JPG, PNG, WEBP, or GIF.'), { statusCode: 415 });
  }

  const fields = {};
  for (const [key, value] of Object.entries(data.fields || {})) {
    if (value && typeof value === 'object' && 'value' in value) fields[key] = value.value;
  }
  return { file: { buffer, filename: data.filename || 'screenshot.png' }, fields };
}

export default async function repurposingRoutes(fastify) {
  fastify.addHook('preHandler', adminAuth);

  /* ----------------------------- Drafts ----------------------------- */

  // Create a draft from an uploaded screenshot (multipart)
  fastify.post('/drafts', async (request, reply) => {
    try {
      const { file, fields } = await readUploadedImage(request);
      if (!file) {
        return reply.status(400).send({ error: true, message: 'A product screenshot is required' });
      }
      if (!fields.sourcePrice || Number(fields.sourcePrice) <= 0) {
        return reply.status(400).send({ error: true, message: 'Source price is required' });
      }

      const screenshot = await uploadMedia(file.buffer, `repurposing-source-${file.filename}`);
      const draft = await createDraft(fastify.db, {
        screenshot: {
          url: screenshot.url,
          publicId: screenshot.publicId,
          width: screenshot.width,
          height: screenshot.height,
        },
        fields,
        createdBy: request.admin?.username,
      });
      return reply.status(201).send({ success: true, data: draft });
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to create draft');
    }
  });

  fastify.get('/drafts', async (request, reply) => {
    try {
      const result = await listDrafts(fastify.db, request.query);
      return { success: true, data: result };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load drafts');
    }
  });

  fastify.get('/drafts/:id', async (request, reply) => {
    try {
      const draft = await getDraft(fastify.db, request.params.id);
      if (!draft) return reply.status(404).send({ error: true, message: 'Draft not found' });
      return { success: true, data: draft };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load draft');
    }
  });

  // Edit draft copy / input / pricing fields
  fastify.put('/drafts/:id', async (request, reply) => {
    try {
      const draft = await getDraft(fastify.db, request.params.id);
      if (!draft) return reply.status(404).send({ error: true, message: 'Draft not found' });

      const body = request.body || {};
      const set = {};

      if (body.copy && typeof body.copy === 'object') {
        set.copy = { ...draft.copy, ...body.copy };
      }
      if (body.input && typeof body.input === 'object') {
        set.input = { ...draft.input, ...body.input };
      }
      if (body.source && typeof body.source === 'object') {
        set.source = { ...draft.source, ...body.source, price: Number(body.source.price ?? draft.source.price) || 0 };
      }
      if (body.imageInstructions !== undefined) {
        set.imageInstructions = String(body.imageInstructions);
      }
      if (body.suggestedPrice !== undefined) {
        const price = Number(body.suggestedPrice);
        if (!Number.isFinite(price) || price <= 0) {
          return reply.status(400).send({ error: true, message: 'Selling price must be a positive number' });
        }
        set.pricing = { ...(draft.pricing || {}), suggestedPrice: price, manualOverride: true };
      }
      if (body.status === 'ready_to_publish' && draft.copy?.name) {
        set.status = 'ready_to_publish';
      }

      // Re-run risk checks when copy changes
      if (set.copy) {
        set.risk = assessRisk({
          copy: set.copy,
          pricing: set.pricing || draft.pricing,
          adminNotes: (set.input || draft.input).adminNotes,
        });
      }

      const updated = await updateDraft(fastify.db, request.params.id, set);
      return { success: true, data: updated };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to update draft');
    }
  });

  fastify.delete('/drafts/:id', async (request, reply) => {
    try {
      const deleted = await deleteDraft(fastify.db, request.params.id);
      if (!deleted) return reply.status(404).send({ error: true, message: 'Draft not found' });
      return { success: true, message: 'Draft deleted' };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to delete draft');
    }
  });

  /* --------------------------- AI actions --------------------------- */

  fastify.post('/drafts/:id/generate-copy', async (request, reply) => {
    try {
      const draft = await generateCopyForDraft(fastify.db, request.params.id);
      return { success: true, data: draft };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Copy generation failed');
    }
  });

  fastify.post('/drafts/:id/generate-image', async (request, reply) => {
    try {
      const draft = await generateImageForDraft(fastify.db, request.params.id);
      return { success: true, data: draft };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Image generation failed');
    }
  });

  // Full pipeline: copy, then image (respecting the auto-generate setting)
  fastify.post('/drafts/:id/generate', async (request, reply) => {
    try {
      let draft = await generateCopyForDraft(fastify.db, request.params.id);
      const settings = await getAiSettings(fastify.db);
      let imageError = null;
      if (settings.autoGenerateImage) {
        try {
          draft = await generateImageForDraft(fastify.db, request.params.id);
        } catch (error) {
          imageError = error.message;
          draft = await getDraft(fastify.db, request.params.id);
        }
      }
      return { success: true, data: draft, imageError };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Generation failed');
    }
  });

  fastify.post('/drafts/:id/accept-image', async (request, reply) => {
    try {
      const draft = await getDraft(fastify.db, request.params.id);
      if (!draft) return reply.status(404).send({ error: true, message: 'Draft not found' });
      if (!draft.generatedImage) return reply.status(400).send({ error: true, message: 'No generated image to accept' });
      const updated = await updateDraft(fastify.db, request.params.id, {
        imageStatus: 'accepted',
        generatedImage: { ...draft.generatedImage, status: 'accepted' },
        status: draft.copy?.name ? 'ready_to_publish' : draft.status,
      });
      return { success: true, data: updated };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to accept image');
    }
  });

  fastify.post('/drafts/:id/reject-image', async (request, reply) => {
    try {
      const draft = await getDraft(fastify.db, request.params.id);
      if (!draft) return reply.status(404).send({ error: true, message: 'Draft not found' });
      const updated = await updateDraft(fastify.db, request.params.id, {
        imageStatus: 'rejected',
        generatedImage: null,
      });
      return { success: true, data: updated };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to reject image');
    }
  });

  // Manual replacement image upload (multipart)
  fastify.post('/drafts/:id/replace-image', async (request, reply) => {
    try {
      const draft = await getDraft(fastify.db, request.params.id);
      if (!draft) return reply.status(404).send({ error: true, message: 'Draft not found' });

      const { file } = await readUploadedImage(request);
      if (!file) return reply.status(400).send({ error: true, message: 'An image file is required' });

      // Neutral filename: this URL ends up on the public storefront.
      const ext = (file.filename.split('.').pop() || 'png').toLowerCase();
      const uploaded = await uploadMedia(file.buffer, `product-${request.params.id}-manual.${ext}`);
      const version = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        status: 'accepted',
        manual: true,
        createdAt: new Date(),
      };
      const { ObjectId } = await import('mongodb');
      const updated = await fastify.db.collection('repurposing_drafts').findOneAndUpdate(
        { _id: new ObjectId(request.params.id) },
        {
          $set: {
            generatedImage: version,
            imageStatus: 'accepted',
            status: draft.copy?.name ? 'ready_to_publish' : draft.status,
            updatedAt: new Date(),
          },
          $push: { imageVersions: version },
        },
        { returnDocument: 'after' }
      );
      return { success: true, data: updated };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to upload replacement image');
    }
  });

  /* ----------------------------- Pricing ---------------------------- */

  fastify.post('/drafts/:id/recalculate-price', async (request, reply) => {
    try {
      const draft = await getDraft(fastify.db, request.params.id);
      if (!draft) return reply.status(404).send({ error: true, message: 'Draft not found' });
      const settings = await getPricingSettings(fastify.db);
      const pricing = calculatePricing(settings, {
        sourcePrice: draft.source.price,
        sourceCurrency: draft.source.currency,
        category: draft.input.category || draft.copy?.suggestedCategory,
      });
      const updated = await updateDraft(fastify.db, request.params.id, { pricing });
      return { success: true, data: updated };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to recalculate price');
    }
  });

  fastify.get('/pricing-settings', async (request, reply) => {
    try {
      const settings = await getPricingSettings(fastify.db);
      return { success: true, data: settings };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load pricing settings');
    }
  });

  fastify.put('/pricing-settings', async (request, reply) => {
    try {
      const settings = await savePricingSettings(fastify.db, request.body || {});
      return { success: true, data: settings };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to save pricing settings');
    }
  });

  /* --------------------------- AI settings -------------------------- */

  fastify.get('/settings', async (request, reply) => {
    try {
      const settings = await getAiSettings(fastify.db);
      return { success: true, data: toPublicAiSettings(settings) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load AI settings');
    }
  });

  fastify.put('/settings', async (request, reply) => {
    try {
      const settings = await saveAiSettings(fastify.db, request.body || {});
      return { success: true, data: toPublicAiSettings(settings) };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to save AI settings');
    }
  });

  /* ----------------------------- Publish ---------------------------- */

  fastify.post('/drafts/:id/publish', async (request, reply) => {
    try {
      const product = await publishDraft(fastify.db, request.params.id, {
        riskOverrideReason: request.body?.riskOverrideReason,
      });
      return { success: true, data: product };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to publish draft');
    }
  });

  fastify.post('/drafts/:id/reject', async (request, reply) => {
    try {
      const updated = await updateDraft(fastify.db, request.params.id, {
        status: 'rejected',
        rejectedReason: request.body?.reason || '',
      });
      if (!updated) return reply.status(404).send({ error: true, message: 'Draft not found' });
      return { success: true, data: updated };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to reject draft');
    }
  });

  /* ---------------------- Imported order support -------------------- */

  fastify.get('/orders/:orderId/source-info', async (request, reply) => {
    try {
      const info = await getSourceInfoForOrder(fastify.db, request.params.orderId);
      if (!info) return reply.status(404).send({ error: true, message: 'Order not found' });
      return { success: true, data: { ...info, fulfilmentStatuses: ADMIN_FULFILMENT_STATUSES } };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to load source info');
    }
  });

  fastify.put('/orders/:orderId/fulfilment', async (request, reply) => {
    try {
      const result = await setOrderFulfilmentStatus(fastify.db, request.params.orderId, request.body || {});
      return { success: true, data: result };
    } catch (error) {
      fastify.log.error(error);
      return sendError(reply, error, 'Failed to update fulfilment status');
    }
  });
}
