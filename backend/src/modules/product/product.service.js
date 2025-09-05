// src/modules/product/product.service.js

const Product = require('./Product.model');
const User = require('../user/User.model');
const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require("../category/Category.model");
const Pharmacy = require('../pharmacy/Pharmacy.model');

const productService = {

  async createNewProduct(user, productData) {
    const { name, type, categoryName, sub_category, brand, description, manufacturer, imageUrl, price } = productData;
    if (!name) throw new Error('Product name is required');
    if (!categoryName) throw new Error('Category name is required');

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) throw new Error('Product already exists with this name');

    const foundCategory = await Category.findOne({ name: categoryName });
    if (!foundCategory) throw new Error(`Category with name "${categoryName}" not found`);

    const product = new Product({
      name, type, category: foundCategory._id, sub_category, brand, description, manufacturer, imageUrl, price,
      createdBy: user._id, isAdminCreated: user.role === 'admin',
    });
    return await product.save();
  },

 
  async findVisibleProducts(user) {
    if (user) {
      if (user.role === 'admin' || user.role === 'user') {
        return await Product.find();
      } else if (user.role === 'pharmacist') {
        return await Product.find({ $or: [{ isAdminCreated: true }, { createdBy: user._id }] });
      } else {
        throw new Error('Access denied. Invalid user role.');
      }
    } else {
      return await Product.find();
    }
  },

  
  async findProductById(productId) {
    return await Product.findById(productId);
  },

  
  async updateProductById(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
  },

  async deleteProductById(productId) {
    return await Product.findByIdAndDelete(productId);
  },

async findProductBySlug(name) {
  const slug = slugify(name, { lower: true });

  // escape الرموز الخاصة عشان regex ما يكسر
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapeRegex(slug), 'i');

  const products = await Product.find({ slug: { $regex: regex } })
    .select('name description slug price imageUrl brand') // الحقول الأساسية
    .sort({ createdAt: -1 });

  return products;
}

// async findProductsBySlug(name, page = 1, limit = 10) {
//   const searchTerm = name.trim();
//   const pageNum = Math.max(parseInt(page, 10) || 1, 1);
//   const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
//   const skip = (pageNum - 1) * limitNum;

//   // دالة لعمل escape للرموز الخاصة في regex
//   const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   const regex = new RegExp(escapeRegex(searchTerm), 'i');

//   const query = {
//     isActive: true,
//     name: { $regex: regex }
//   };

//   const products = await Product.find(query)
//     .select('name slug price imageUrl brand')
//     .skip(skip)
//     .limit(limitNum)
//     .sort({ createdAt: -1 });

//   const total = await Product.countDocuments(query);

//   return { products, total };
// }

,

 
  async getSearchSuggestions(query) {
    return await Product.find({ name: { $regex: query, $options: 'i' } }).limit(10).select('name');
  },


  async toggleProductFavorite(user, productId) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const index = user.favorites.indexOf(product._id);
    let message = '';

    if (index === -1) {
      user.favorites.push(product._id);
      message = 'Product added to favorites';
    } else {
      user.favorites.splice(index, 1);
      message = 'Product removed from favorites';
    }
    await user.save();
    return { message, favorites: user.favorites };
  },

  async findFavoriteProducts(userId) {
    const user = await User.findById(userId).lean();
    if (!user || !Array.isArray(user.favorites)) {
      throw new Error('المفضلة غير صالحة');
    }
    const validFavorites = user.favorites.filter(fav => mongoose.Types.ObjectId.isValid(fav));
    return await Product.find({ _id: { $in: validFavorites } });
  },


  async searchByLocation(user, productName) {
    if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
      throw new Error('User location (coordinates) is required');
    }
    const userCoordinates = user.location.coordinates;

    const mainProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });
    if (!mainProduct) {
      throw new Error('Product not found in the system');
    }

    const alternativeProducts = await Product.find({ sub_category: mainProduct.sub_category, _id: { $ne: mainProduct._id } }).select('_id name');
    const relevantProductIds = [mainProduct._id, ...alternativeProducts.map(p => p._id)];

    const pipeline = [
        { $geoNear: { near: { type: 'Point', coordinates: userCoordinates }, distanceField: 'distance', maxDistance: 5000000, spherical: true } },
        { $match: { 'medicines.medicineId': { $in: relevantProductIds } } },
        { $unwind: '$medicines' },
        { $match: { 'medicines.medicineId': { $in: relevantProductIds } } },
        { $lookup: { from: 'products', localField: 'medicines.medicineId', foreignField: '_id', as: 'productDetails' } },
        { $unwind: '$productDetails' },
        { $group: {
            _id: '$medicines.medicineId',
            productDetails: { $first: '$productDetails' },
            pharmacies: { $push: { pharmacyId: '$_id', pharmacyName: '$name', distance: '$distance', price: '$medicines.price', pharmacyLocation: '$location' } }
        }},
        { $project: {
            _id: 0,
            product: {
                _id: '$productDetails._id', name: '$productDetails.name', type: '$productDetails.type', category: '$productDetails.category',
                sub_category: '$productDetails.sub_category', brand: '$productDetails.brand', description: '$productDetails.description',
                manufacturer: '$productDetails.manufacturer', imageUrl: '$productDetails.imageUrl', price: '$productDetails.price',
                createdAt: '$productDetails.createdAt', updatedAt: '$productDetails.updatedAt', slug: '$productDetails.slug', __v: '$productDetails.__v'
            },
            pharmacies: 1
        }}
    ];

    const productResults = await Pharmacy.aggregate(pipeline);
    
    // إعلام: لم أغير أي شيء في console.log
    console.log("Aggregation Results:", JSON.stringify(productResults, null, 2));

    if (!productResults || productResults.length === 0) {
      throw new Error(`No nearby pharmacies found selling "${mainProduct.name}" or its alternatives within 5 km.`);
    }

    const mainProductResult = productResults.find(item => item.product && item.product._id && item.product._id.equals(mainProduct._id));
    const alternativeResults = productResults.filter(item => item.product && item.product._id && !item.product._id.equals(mainProduct._id));

    const responseData = {};
    if (mainProductResult) {
        responseData.mainProduct = mainProductResult;
    }
    responseData.alternatives = alternativeResults || [];

    return responseData;
  }
};

module.exports = productService;