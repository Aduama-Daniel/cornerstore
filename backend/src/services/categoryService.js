export const getAllCategories = async (db) => {
  const collection = db.collection('categories');

  const categories = await collection
    .find({})
    .sort({ name: 1 })
    .toArray();

  return categories;
};

export const getCategoryBySlug = async (db, slug) => {
  const collection = db.collection('categories');
  const category = await collection.findOne({ slug });
  return category;
};

export const getCategoryById = async (db, categoryId) => {
  const collection = db.collection('categories');
  const { ObjectId } = await import('mongodb');

  const category = await collection.findOne({ _id: new ObjectId(categoryId) });
  return category;
};

// Admin functions
export const createCategory = async (db, categoryData) => {
  const collection = db.collection('categories');

  const category = {
    ...categoryData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(category);
  return { ...category, _id: result.insertedId };
};

export const updateCategory = async (db, categoryId, categoryData) => {
  const collection = db.collection('categories');
  const { ObjectId } = await import('mongodb');

  const updateData = {
    ...categoryData,
    updatedAt: new Date()
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(categoryId) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return result;
};

export const deleteCategory = async (db, categoryId) => {
  const collection = db.collection('categories');
  const { ObjectId } = await import('mongodb');

  const result = await collection.deleteOne({ _id: new ObjectId(categoryId) });
  return result.deletedCount > 0;
};

