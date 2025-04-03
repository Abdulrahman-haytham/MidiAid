// controllers/product.controller.js
const Product = require('../models/Product');
const User = require('../models/user');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Create a new product
exports.createProduct = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists' });
    }

    const product = new Product({
      name,
      type,
      category,
      sub_category,
      brand,
      description,
      manufacturer,
      imageUrl,
      price,
      createdBy: user._id,
      isAdminCreated: user.role === 'admin',
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    let products;
    const user = req.user;

    if (user) {
      if (user.role === 'admin' || user.role === 'user') {
        products = await Product.find();
      } else if (user.role === 'pharmacist') {
        products = await Product.find({
          $or: [{ isAdminCreated: true }, { createdBy: user._id }],
        });
      } else {
        return res.status(403).json({ message: 'Access denied. Invalid user role.' });
      }
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product retrieved successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// Search for a product by slug
exports.searchProductBySlug = async (req, res) => {
  try {
    const slug = slugify(req.params.name, { lower: true });
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product found successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search for product', error: error.message });
  }
};


exports.getSuggestions = async (req, res) => {
    try {
      const query = req.query.query;
      const products = await Product.find({
        name: { $regex: query, $options: 'i' } 
      }).limit(10).select('name');  // هنا نقوم بتحديد الحقل name فقط
    
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// Add product to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (user.favorites.includes(product._id)) {
      return res.status(400).json({ error: 'Product is already in favorites' });
    }

    user.favorites.push(product._id);
    await user.save();

    res.status(200).json({ message: 'Product added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all favorite products for the current user
exports.getFavoriteProducts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean(); // استخدام lean لتسريع القراءة
        
        if (!user || !Array.isArray(user.favorites)) {
            return res.status(400).json({ message: 'المفضلة غير صالحة' });
        }
  
        // تصفية المعرّفات غير الصالحة قبل `populate`
        const validFavorites = user.favorites.filter(fav => mongoose.Types.ObjectId.isValid(fav));
  
        // جلب المنتجات المرتبطة بالمفضلة
        const favoriteProducts = await Product.find({ _id: { $in: validFavorites } });
  
        res.status(200).json({ favorites: favoriteProducts });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ ما', error: error.message });
    }
  }

  


// Search products based on user's location
exports.searchProductsByLocation = async (req, res) => {
  try {
    const { productName } = req.query;
    const user = await User.findById(req.user._id);
    if (!user || !user.location) {
      return res.status(400).json({ success: false, message: 'User location is required' });
    }

    const { coordinates } = user.location;
    const mainProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });

    if (!mainProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const subCategory = mainProduct.sub_category;
    const alternativeProducts = await Product.find({
      sub_category: subCategory,
      _id: { $ne: mainProduct._id },
    });

    const pharmacies = await Pharmacy.find({
      'medicines.medicineId': { $in: [mainProduct._id, ...alternativeProducts.map(p => p._id)] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 5000,
        },
      },
    }).populate('medicines.medicineId', 'name price');

    const response = {
      success: true,
      message: 'Products found successfully',
      data: {
        mainProduct: {
          ...mainProduct.toObject(),
          pharmacies: pharmacies.filter(pharmacy =>
            pharmacy.medicines.some(med => med.medicineId._id.equals(mainProduct._id))
          ).map(pharmacy => ({
            pharmacyId: pharmacy._id,
            pharmacyName: pharmacy.name,
            distance: 'Calculated by MongoDB',
            price: pharmacy.medicines.find(med => med.medicineId._id.equals(mainProduct._id)).price,
          })),
        },
        alternatives: alternativeProducts.map(product => ({
          ...product.toObject(),
          pharmacies: pharmacies.filter(pharmacy =>
            pharmacy.medicines.some(med => med.medicineId._id.equals(product._id))
          ).map(pharmacy => ({
            pharmacyId: pharmacy._id,
            pharmacyName: pharmacy.name,
            distance: 'Calculated by MongoDB',
            price: pharmacy.medicines.find(med => med.medicineId._id.equals(product._id)).price,
          })),
        })),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search for products', error: error.message });
  }
};
