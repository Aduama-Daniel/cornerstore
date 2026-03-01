import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchProductsAI, getProductBySlug, getFeaturedProducts } from './productService.js';
import { addToCart } from './cartService.js';
import { searchOrders } from './orderService.js';

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDqlGTm4G_t5zrMzkeBz9GAvntzUsDat70';
console.log('[GEMINI] Initializing with API key:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}` : 'NOT SET');
console.log('[GEMINI] Environment check:', {
    GEMINI_API_KEY_SET: !!process.env.GEMINI_API_KEY,
    using_fallback: !process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
});

const genAI = new GoogleGenerativeAI(apiKey);

const tools = [
    {
        functionDeclarations: [
            {
                name: "searchProducts",
                description: "Search for products based on user query, category, maximum price, or color. Use this when the user is looking for items to buy.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        query: { type: "STRING", description: "The main search term (e.g., 'dresses', 'black cargos')" },
                        category: { type: "STRING", description: "The product category" },
                        maxPrice: { type: "NUMBER", description: "Maximum price" },
                        color: { type: "STRING", description: "Requested color" }
                    }
                }
            },
            {
                name: "getProductDetails",
                description: "Get detailed information about a specific product, including available sizes and stock. Use this to confirm details before adding to cart.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        productSlug: { type: "STRING", description: "The slug of the product to look up" }
                    },
                    required: ["productSlug"]
                }
            },
            {
                name: "getRecommendations",
                description: "Get product recommendations such as trending or top items.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        type: { type: "STRING", description: "Type of recommendations: 'trending', 'featured'" }
                    }
                }
            },
            {
                name: "addToCart",
                description: "Add a product to the user's shopping cart. You MUST confirm the size with the user first if the product has sizes.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        productId: { type: "STRING", description: "The ID of the product" },
                        size: { type: "STRING", description: "The selected size (e.g., 'M', 'L')" },
                        quantity: { type: "NUMBER", description: "Quantity to add" }
                    },
                    required: ["productId", "quantity"]
                }
            },
            {
                name: "trackOrder",
                description: "Check the status of a user's order using their order number.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        orderNumber: { type: "STRING", description: "The order number provided by the user" }
                    },
                    required: ["orderNumber"]
                }
            }
        ]
    }
];

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: tools
});

const systemInstruction = `
You are a helpful and knowledgeable sales assistant for "Cornerstore", a premium fashion and design store.
Your goal is to help customers find products, answer questions about items, and provide style advice.

CRITICAL GUIDELINES:
1. Be polite, professional, and concise.
2. Use your tools to search for products, get recommendations, and check product details. Never guess or hallucinate products.
3. If the user asks to add an item to their cart, you MUST ensure you have the required size before calling the addToCart tool. If they don't specify a size, ask them! Do not guess.
4. If the user asks about shipping or returns, answer with this fixed information: "We offer free shipping on orders over $100 and 30-day returns." Do not make up policies.
5. If the user asks to track an order, ask for their order number (if not provided) and use the trackOrder tool. Do not guess order statuses.
6. DO NOT attempt to navigate the user to different pages.
7. DO NOT apply random discounts or make up prices.
8. Validate all requests via tools. Your responses should be helpful and guide the shopping experience.
`;

/**
 * Utility function to retry API calls with exponential backoff for rate limiting
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelayMs = 2000) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`[GEMINI] Attempt ${attempt + 1}/${maxRetries}`);
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if it's a rate limit error (429)
            if (error.status === 429) {
                const delayMs = baseDelayMs * Math.pow(2, attempt);
                console.warn(`[GEMINI] Rate limited (429). Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                // For other errors, don't retry
                throw error;
            }
        }
    }

    // All retries exhausted
    throw lastError;
};

/**
 * Generates a response from the Gemini model based on user message and history.
 * @param {Object} db - MongoDB database instance
 * @param {string} message - The user's current message
 * @param {Array} history - The chat history (optional)
 * @param {string|null} userId - The authenticated user's ID
 * @returns {Promise<Object>} - The model's response text and data payload
 */
export const generateResponse = async (db, message, history = [], userId = null) => {
    try {
        console.log('[GEMINI] Starting generateResponse:', {
            messageLength: message.length,
            historyLength: history.length,
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString()
        });

        const chatOptions = {
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            })),
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
            }
        };

        console.log('[GEMINI] Creating chat session with', chatOptions.history.length, 'history items');
        const chat = model.startChat(chatOptions);

        console.log('[GEMINI] Sending message to Gemini API...');
        // Wrap the API call with retry logic for rate limiting
        let result = await retryWithBackoff(() => chat.sendMessage(message));
        let response = await result.response;

        console.log('[GEMINI] Received response from API');
        console.log('[GEMINI] Response object keys:', Object.keys(response));
        console.log('[GEMINI] functionCalls type:', typeof response.functionCalls);

        let payload = {};

        // Handle function calls loop - with defensive null checking
        let calls = [];
        if (typeof response.functionCalls === 'function') {
            const functionCallsResult = response.functionCalls();
            console.log('[GEMINI] functionCalls() returned:', functionCallsResult ? 'array-like object' : 'null/undefined', 'length:', functionCallsResult?.length);
            calls = functionCallsResult || [];
        } else {
            console.log('[GEMINI] response.functionCalls is not a function');
        }

        while (calls && calls.length > 0) {
            console.log('[GEMINI] Processing', calls.length, 'function calls');
            const functionResponses = [];

            for (const call of calls) {
                const { name, args } = call;
                console.log('[GEMINI] Function call:', { name, args });
                let apiResponse;

                try {
                    if (name === 'searchProducts') {
                        console.log('[GEMINI] Calling searchProductsAI');
                        const items = await searchProductsAI(db, args);

                        console.log('[GEMINI] Found', items.length, 'products');
                        apiResponse = { products: items };
                        payload.products = items;
                    } else if (name === 'getProductDetails') {
                        console.log('[GEMINI] Calling getProductBySlug:', args.productSlug);
                        const product = await getProductBySlug(db, args.productSlug);
                        if (product) {
                            console.log('[GEMINI] Found product:', product._id);
                            apiResponse = { product };
                            payload.products = [product];
                        } else {
                            console.warn('[GEMINI] Product not found:', args.productSlug);
                            apiResponse = { error: "Product not found" };
                        }
                    } else if (name === 'getRecommendations') {
                        console.log('[GEMINI] Calling getFeaturedProducts');
                        const items = await getFeaturedProducts(db, 8);
                        console.log('[GEMINI] Got', items.length, 'recommendations');
                        apiResponse = { products: items };
                        payload.products = items;
                    } else if (name === 'addToCart') {
                        console.log('[GEMINI] addToCart called');
                        if (!userId) {
                            console.warn('[GEMINI] Cannot add to cart - user not logged in');
                            apiResponse = { error: "User is not logged in. Ask them to log in first." };
                        } else {
                            console.log('[GEMINI] Adding to cart for user:', userId);
                            await addToCart(db, userId, {
                                productId: args.productId,
                                size: args.size || '',
                                quantity: args.quantity || 1
                            });
                            console.log('[GEMINI] Successfully added to cart');
                            apiResponse = { success: true, message: "Added to cart" };
                            payload.cartSuccess = true;
                        }
                    } else if (name === 'trackOrder') {
                        console.log('[GEMINI] Tracking order:', args.orderNumber);
                        const searchRes = await searchOrders(db, args.orderNumber, { limit: 1 });
                        if (searchRes.orders && searchRes.orders.length > 0) {
                            const order = searchRes.orders[0];
                            if (userId && order.userId !== userId) {
                                console.warn('[GEMINI] User does not own this order');
                                apiResponse = { error: "This order does not belong to the current user. Cannot expose details." };
                            } else {
                                console.log('[GEMINI] Found order:', order._id);
                                apiResponse = {
                                    status: order.status,
                                    paymentStatus: order.paymentStatus,
                                    trackingUrl: order.trackingUrl || null,
                                    carrier: order.carrier || null,
                                    estimatedDelivery: order.estimatedDelivery || null
                                };
                                payload.order = apiResponse;
                            }
                        } else {
                            console.warn('[GEMINI] Order not found:', args.orderNumber);
                            apiResponse = { error: "Order not found" };
                        }
                    } else {
                        console.warn('[GEMINI] Unknown function:', name);
                        apiResponse = { error: "Unknown function" };
                    }
                } catch (err) {
                    console.error('[GEMINI] Function execution error:', {
                        function: name,
                        error: err.message,
                        stack: err.stack
                    });
                    apiResponse = { error: err.message };
                }

                functionResponses.push({
                    functionResponse: {
                        name,
                        response: apiResponse
                    }
                });
            }

            // Send function responses back to Gemini
            console.log('[GEMINI] Sending function responses back to API');
            // Wrap the API call with retry logic for rate limiting
            result = await retryWithBackoff(() => chat.sendMessage(functionResponses));
            response = await result.response;
            console.log('[GEMINI] Received follow-up response');

            // Re-fetch calls from the new response
            calls = [];
            if (typeof response.functionCalls === 'function') {
                const functionCallsResult = response.functionCalls();
                calls = functionCallsResult || [];
                console.log('[GEMINI] Follow-up has', calls.length, 'additional function calls');
            }
        }

        const text = response.text();
        console.log('[GEMINI] Final response text length:', text.length);

        return {
            text,
            payload
        };
    } catch (error) {
        console.error('[GEMINI] Critical error in generateResponse:', {
            error: error.message,
            code: error.code,
            status: error.status,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Provide specific error message for rate limiting
        let errorMessage = "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
        if (error.status === 429) {
            errorMessage = "I'm currently receiving too many requests. Please wait a moment and try again.";
        }

        return {
            text: errorMessage,
            payload: {}
        };
    }
};
