const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');
const Product = require('../models/Product');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const slugify = require('slugify');
   
const Order = require('../models/Order');

   


/**
 * @desc    Create a new pharmacy
 * @route   POST /api/pharmacies
 * @access  Private
 */
exports.createPharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, address, location, phone, openingHours, imageUrl, description, services, socialMedia, website, medicines } = req.body;

    const pharmacy = new Pharmacy({
      userId: req.user.id,
      name,
      address,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      phone,
      openingHours,
      imageUrl,
      description,
      services,
      socialMedia,
      website,
      medicines,
    });

    await pharmacy.save();
    res.status(201).json({ message: 'Pharmacy created successfully', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
};


exports.updatePharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // استخدام الـ userId من التوكن (المستخدم الذي قام بتسجيل الدخول)
    const userId = req.user.id;

    const {
      name,
      address,
      location,
      phone,
      openingHours,
      imageUrl,
      description,
      services,
      socialMedia,
      website,
      medicines,
    } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (location && location.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }
    if (phone) updates.phone = phone;
    if (openingHours) updates.openingHours = openingHours;
    if (imageUrl) updates.imageUrl = imageUrl;
    if (description) updates.description = description;
    if (services) updates.services = services;
    if (socialMedia) updates.socialMedia = socialMedia;
    if (website) updates.website = website;
    if (medicines) updates.medicines = medicines;

    // البحث عن الصيدلية بناءً على userId فقط
    const updatedPharmacy = await Pharmacy.findOneAndUpdate(
      { userId: userId },  // شرط البحث عن الصيدلية بناءً على الـ userId
      { $set: updates }, // تحديث البيانات
      { new: true }
    );

    if (!updatedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found or unauthorized' });
    }

    res.status(200).json({ message: 'Pharmacy updated successfully', pharmacy: updatedPharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};



exports.getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id })
      .populate({
        path: 'medicines.medicineId',
        select: 'name imageUrl description category',
      })
      .populate({
        path: 'reviews.userId',
        select: 'name email',
      })
      .exec();

    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية لهذا المستخدم' });
    }

    // احسب عدد الأدوية وعدد التقييمات
    const medicineCount = pharmacy.medicines.length;
    const reviewCount = pharmacy.reviews.length;

    // احسب وصف التقييم اللفظي
    const avg = pharmacy.averageRating;
    let ratingLabel = '';
    if (avg >= 4.5) ratingLabel = 'ممتاز';
    else if (avg >= 3.5) ratingLabel = 'جيد جداً';
    else if (avg >= 2.5) ratingLabel = 'جيد';
    else if (avg > 0) ratingLabel = 'ضعيف';
    else ratingLabel = 'لا يوجد تقييم بعد';

    res.status(200).json({
      pharmacy: {
        ...pharmacy.toObject(),
        medicineCount,
        reviewCount,
        ratingLabel,
        createdAt: pharmacy.createdAt,
        updatedAt: pharmacy.updatedAt,
        isActive: pharmacy.isActive,
      },
    });
  } catch (error) {
    console.error('خطأ بجلب بيانات الصيدلية:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الصيدلية' });
  }
};

/**
 * @desc    Get all pharmacies (without sensitive data)
 * @route   GET /api/pharmacies
 * @access  Public
 */
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true }).select(
      'name address location phone openingHours imageUrl averageRating services'
    );
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get full pharmacy details (including products and reviews)
 * @route   GET /api/pharmacies/details
 * @access  Private
 */
exports.getPharmacyDetails = async (req, res) => {
  try {
    const pharmacyId = req.params.id;
    console.log(pharmacyId)

    const pharmacy = await Pharmacy.findById(pharmacyId)
      
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
      
    }

    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in getPharmacyDetails controller ", error);
  }
};

/**
 * @desc    Add a rating to a pharmacy (without comments)
 * @route   POST /api/pharmacies/:id/rate
 * @access  Private
 */
exports.ratePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const existingReview = pharmacy.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already rated this pharmacy' });
    }

    pharmacy.reviews.push({ userId, rating });
    pharmacy.calculateAverageRating();
    await pharmacy.save();

    res.status(201).json({ message: 'Rating added successfully', averageRating: pharmacy.averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Add a product to the pharmacy
 * @route   POST /api/pharmacies/add-product
 * @access  Private
 */
exports.addProductToPharmacy = async (req, res) => {
  const { productId, quantity, price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const existingProduct = pharmacy.medicines.find((p) => p.medicineId.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
      existingProduct.price = price;
    } else {
      pharmacy.medicines.push({ medicineId: productId, quantity, price });
    }

    await pharmacy.save();
    res.status(200).json({ message: 'Product added successfully', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyPharmacyOrders = async (req, res) => {
  try {
    // نجيب الصيدلية المرتبطة بالمستخدم الحالي
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });

    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية لهذا المستخدم' });
    }

    // نجيب كل الطلبات المرتبطة بهي الصيدلية
    const orders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('userId', 'name email') // معلومات المستخدم يلي عامل الطلب
      .populate('items.productId', 'name price') // معلومات المنتجات داخل الطلب
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات' });
  }
};
/**
 * @desc    Find nearby pharmacies based on geolocation
 * @route   GET /api/pharmacies/nearby
 * @access  Public
 */
exports.findNearbyPharmacies = async (req, res) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Longitude and latitude are required' });
  }

  try {
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('name location _id'); // ✅ هون التعديل

    res.status(200).json(nearbyPharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/pharmacies/create-product
 * @access  Private
 */
exports.createProduct = async (req, res) => {
  const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newProduct = new Product({
      name,
      type,
      category,
      sub_category,
      brand,
      description,
      manufacturer,
      imageUrl,
      price,
      createdBy: req.user.id,
      isAdminCreated: user.role === 'admin',
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in createProduct controller ", error)
  }
};
