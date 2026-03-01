export const searchProducts = async (db, query, filters = {}, limit = 20) => {
  const collection = db.collection('products');
  
  // Build search query
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    ...filters
  };
  
  // Search with text score
  const products = await collection
    .find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .toArray();
  
  // If no results with text search, try regex search as fallback
  if (products.length === 0) {
    const regexQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ],
      status: 'active',
      ...filters
    };
    
    const fallbackProducts = await collection
      .find(regexQuery)
      .limit(limit)
      .toArray();
    
    return fallbackProducts;
  }
  
  return products;
};
