const express = require('express');
const Product = require('../models/Product'); // Ensure the correct path to the Product model
const router = express.Router();
const slugify = require('slugify'); // Library for generating slugs from strings
const User = require('../models/user'); // تأكد من المسار الصحيح للمودل
const mongoose = require('mongoose');

const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
router.post('/', isAuthenticated, hasRole('admin'), async (req, res) => {
  // جلب بيانات المستخدم الحالي
  const user = req.user; // يتم تعبئة req.user بواسطة middleware المصادقة
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  try {
    const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

    // Check if the product name is provided
    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    // Check if the product already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists' });
    }

    // Create the product
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
      createdBy: user._id, // تعيين createdBy تلقائيًا
      isAdminCreated: user.role === 'admin', // تعيين isAdminCreated 
    });

    await product.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public (يمكن للجميع الوصول إليه)
 */
router.get('/products', async (req, res) => {
  try {
    let products;

    // إذا كان المستخدم مسجلًا
    if (req.user) {
      const user = req.user;

      if (user.role === 'admin' || user.role === 'user') {
        // Admins and regular users can see all products
        products = await Product.find();
      } else if (user.role === 'pharmacist') {
        // Pharmacists can only see products created by admins or themselves
        products = await Product.find({
          $or: [{ isAdminCreated: true }, { createdBy: user._id }],
        });
      } else {
        // إذا كان للمستخدم دور غير معروف
        return res.status(403).json({ message: 'Access denied. Invalid user role.' });
      }
    } else {
      // إذا كان المستخدم غير مسجل، قم بإرجاع جميع المنتجات
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product retrieved successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
});

/**
 * @desc    Update a product by ID
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
router.put('/:id', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

    // Update the product
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        category,
        sub_category,
        brand,
        description,
        manufacturer,
        imageUrl,
        price,
      },
      { new: true, runValidators: true } // Return the updated product and run validators
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
router.delete('/:id', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

/**
 * @desc    Search for products by slug
 * @route   GET /api/products/search/:name
 * @access  Public
 */
router.get('/search/:name', async (req, res) => {
  try {
    // Convert the name to a slug
    const slug = slugify(req.params.name, { lower: true });

    // Search using the slug
    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product found successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search for product', error: error.message });
  }
});

/**
 * @desc    Add a product to user's favorites
 * @route   POST /api/products/favorites/:productId
 * @access  Private
 */
/**
 * @desc    Add a product to user's favorites
 * @route   POST /api/products/favorites/:productId
 * @access  Private (يجب أن يكون المستخدم مصادقًا عليه)
 */
router.post('/favorites/:productId', isAuthenticated, async (req, res) => {
  try {
    // جلب المستخدم الحالي
    const user = req.user; // يتم تعبئة req.user بواسطة isAuthenticated
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // التحقق من وجود المنتج
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // التحقق من أن المنتج غير موجود بالفعل في المفضلة
    if (user.favorites.includes(product._id)) {
      return res.status(400).json({ error: 'Product is already in favorites' });
    }

    // إضافة المنتج إلى المفضلة
    user.favorites.push(product._id);
    await user.save();

    res.status(200).json({ message: 'Product added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Get all favorite products for the current user
 * @route   GET /api/products/favorites
 * @access  Private (يجب أن يكون المستخدم مصادقًا عليه)
 */
router.get('/favorites/b', isAuthenticated, async (req, res) => {
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
});


router.get('/search', async (req, res) => {
  try {
    const { productName } = req.query;

    // جلب معلومات المستخدم الحالي
    const user = await User.findById(req.user._id);
    if (!user || !user.location) {
      return res.status(400).json({
        success: false,
        message: 'User location is required',
      });
    }
    const { coordinates } = user.location; // استخراج إحداثيات المستخدم

    // البحث عن الدواء بناءً على الاسم فقط
    const mainProduct = await Product.findOne({
      name: { $regex: productName, $options: 'i' }, // البحث بدون حساسية لحالة الأحرف
    });

    if (!mainProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // استخراج sub-category من الدواء
    const subCategory = mainProduct.sub_category;

    // البحث عن الأدوية البديلة في نفس الـ sub-category
    const alternativeProducts = await Product.find({
      sub_category: subCategory,
      _id: { $ne: mainProduct._id }, // استبعاد المنتج الرئيسي
    });

    // البحث عن الصيدليات التي تبيع هذه الأدوية بالقرب من المستخدم
    const pharmacies = await Pharmacy.find({
      'medicines.medicineId': { $in: [mainProduct._id, ...alternativeProducts.map(p => p._id)] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates }, // استخدام إحداثيات المستخدم
          $maxDistance: 5000 // 5 كم
        }
      }
    }).populate('medicines.medicineId', 'name price');

    // تجهيز الاستجابة
    const response = {
      success: true,
      message: 'Products found successfully',
      data: {
        mainProduct: {
          ...mainProduct.toObject(),
          pharmacies: pharmacies
            .filter(pharmacy =>
              pharmacy.medicines.some(med => med.medicineId._id.equals(mainProduct._id))
            )
            .map(pharmacy => ({
              pharmacyId: pharmacy._id,
              pharmacyName: pharmacy.name,
              distance: 'Calculated by MongoDB',
              price: pharmacy.medicines.find(med => med.medicineId._id.equals(mainProduct._id)).price,
            })),
        },
        alternatives: alternativeProducts.map(product => ({
          ...product.toObject(),
          pharmacies: pharmacies
            .filter(pharmacy =>
              pharmacy.medicines.some(med => med.medicineId._id.equals(product._id))
            )
            .map(pharmacy => ({
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
    res.status(500).json({
      success: false,
      message: 'Failed to search for products',
      error: error.message,
    });
  }
});


module.exports = router;