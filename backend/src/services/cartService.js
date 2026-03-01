import { nanoid } from 'nanoid';
import { getProductById } from './productService.js';

export const getCart = async (db, userId) => {
  const collection = db.collection('carts');

  let cart = await collection.findOne({ userId });

  if (!cart) {
    // Create new cart
    cart = {
      userId,
      items: [],
      updatedAt: new Date()
    };
    await collection.insertOne(cart);
  }

  // Populate product details
  if (cart.items && cart.items.length > 0) {
    const productIds = cart.items.map(item => item.productId);
    const { ObjectId } = await import('mongodb');
    const products = await db.collection('products')
      .find({
        _id: {
          $in: productIds.map(id => {
            return new ObjectId(id);
          })
        }
      }
      )
      .toArray();

    cart.items = cart.items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        ...item,
        product: product ? {
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          status: product.status
        } : null
      };
    });
  }

  return cart;
};

export const addToCart = async (db, userId, { productId, size, quantity }) => {
  const collection = db.collection('carts');
  const { ObjectId } = await import('mongodb');

  // Verify product exists and is available
  const product = await getProductById(db, productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.status !== 'active') {
    throw new Error('Product is not available');
  }

  const validSizes = product.variations && product.variations.length > 0
    ? product.variations.map(v => v.size)
    : (product.sizes || []);

  if (validSizes.length > 0 && !validSizes.includes(size)) {
    throw new Error('Selected size is not available');
  }

  let cart = await collection.findOne({ userId });

  if (!cart) {
    cart = {
      userId,
      items: [],
      createdAt: new Date()
    };
  }

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    item => item.productId === productId && item.size === size
  );

  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      id: nanoid(10),
      productId,
      size,
      quantity,
      price: product.price,
      addedAt: new Date()
    });
  }

  cart.updatedAt = new Date();

  await collection.updateOne(
    { userId },
    { $set: cart },
    { upsert: true }
  );

  return getCart(db, userId);
};

export const updateCartItem = async (db, userId, itemId, quantity) => {
  const collection = db.collection('carts');

  const cart = await collection.findOne({ userId });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  cart.items[itemIndex].quantity = quantity;
  cart.updatedAt = new Date();

  await collection.updateOne(
    { userId },
    { $set: { items: cart.items, updatedAt: cart.updatedAt } }
  );

  return getCart(db, userId);
};

export const removeFromCart = async (db, userId, itemId) => {
  const collection = db.collection('carts');

  const cart = await collection.findOne({ userId });

  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item.id !== itemId);
  cart.updatedAt = new Date();

  await collection.updateOne(
    { userId },
    { $set: { items: cart.items, updatedAt: cart.updatedAt } }
  );

  return getCart(db, userId);
};

export const clearCart = async (db, userId) => {
  const collection = db.collection('carts');

  await collection.updateOne(
    { userId },
    { $set: { items: [], updatedAt: new Date() } }
  );
};

export const syncCart = async (db, userId, localItems) => {
  const collection = db.collection('carts');

  let cart = await collection.findOne({ userId });

  if (!cart) {
    cart = {
      userId,
      items: [],
      createdAt: new Date()
    };
  }

  // Merge local items with server items
  for (const localItem of localItems) {
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === localItem.productId && item.size === localItem.size
    );

    if (existingItemIndex > -1) {
      // Use higher quantity
      cart.items[existingItemIndex].quantity = Math.max(
        cart.items[existingItemIndex].quantity,
        localItem.quantity
      );
    } else {
      // Add local item
      cart.items.push({
        ...localItem,
        id: localItem.id || nanoid(10),
        addedAt: new Date()
      });
    }
  }

  cart.updatedAt = new Date();

  await collection.updateOne(
    { userId },
    { $set: cart },
    { upsert: true }
  );

  return getCart(db, userId);
};
