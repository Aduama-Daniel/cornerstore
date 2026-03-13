export const getAllBrands = async (db) => {
  const collection = db.collection('brands');

  return collection.find({}).sort({ name: 1 }).toArray();
};

export const getBrandById = async (db, brandId) => {
  const collection = db.collection('brands');
  const { ObjectId } = await import('mongodb');

  return collection.findOne({ _id: new ObjectId(brandId) });
};

export const createBrand = async (db, brandData) => {
  const collection = db.collection('brands');

  const brand = {
    ...brandData,
    status: brandData.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(brand);
  return { ...brand, _id: result.insertedId };
};

export const updateBrand = async (db, brandId, brandData) => {
  const collection = db.collection('brands');
  const { ObjectId } = await import('mongodb');

  const updateData = {
    ...brandData,
    updatedAt: new Date(),
  };

  return collection.findOneAndUpdate(
    { _id: new ObjectId(brandId) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
};

export const deleteBrand = async (db, brandId) => {
  const collection = db.collection('brands');
  const { ObjectId } = await import('mongodb');

  const result = await collection.deleteOne({ _id: new ObjectId(brandId) });
  return result.deletedCount > 0;
};
