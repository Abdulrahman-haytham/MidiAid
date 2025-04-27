const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');
const Product = require('../models/Product');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const slugify = require('slugify');
const Order = require('../models/Order');
const Cart=require('../models/Cart')

exports.createPharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      address,
      location,
      phone,
      openingHours,
      workingDays, 
      imageUrl,
      description,
      services,
      socialMedia,
      website,
      medicines,
    } = req.body;

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
      workingDays, 
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
    console.log(error);
  }
};
exports.updatePharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const userId = req.user.id;

    const {
      name,
      address,
      location,
      phone,
      openingHours,
      workingDays, 
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
    if (workingDays) updates.workingDays = workingDays;  
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
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true }).select(
      'name address location phone openingHours workingDays imageUrl averageRating services'
    );
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id })
      .populate({
        path: 'reviews.userId',
        select: 'name email',
      })
      .exec();

    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية لهذا المستخدم' });
    }

    // احسب عدد التقييمات
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
        _id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        openingHours: pharmacy.openingHours,
        workingDays: pharmacy.workingDays,
        imageUrl: pharmacy.imageUrl,
        description: pharmacy.description,
        location: pharmacy.location,
        services: pharmacy.services,
        socialMedia: pharmacy.socialMedia,
        website: pharmacy.website,
        reviews: pharmacy.reviews.map(review => ({
          userId: review.userId,
          rating: review.rating,
        })),
        reviewCount,
        averageRating: pharmacy.averageRating,
        ratingLabel,
        isActive: pharmacy.isActive,
        createdAt: pharmacy.createdAt,
        updatedAt: pharmacy.updatedAt,
      },
    });
  } catch (error) {
    console.error('خطأ بجلب بيانات الصيدلية:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الصيدلية' });
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
exports.checkUserHasPharmacy = async (req, res) => {
  try {
    const userId = req.user._id;
     console.log(userId)
    const pharmacy = await Pharmacy.findOne({ userId });

    if (pharmacy) {
      return res.status(200).json({
        hasPharmacy: true,
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
      });
    } else {
      return res.status(200).json({ hasPharmacy: false });
    }
  } catch (error) {
    console.error('Error checking user pharmacy:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من صيدلية المستخدم' });
  }
};
exports.getPharmacyDetails = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    const pharmacy = await Pharmacy.findById(pharmacyId).lean();

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const publicDetails = {
      _id: pharmacy._id,
      name: pharmacy.name,
      imageUrl: pharmacy.imageUrl,
      address: pharmacy.address,
      phone: pharmacy.phone,
      openingHours: pharmacy.openingHours,
      workingDays: pharmacy.workingDays,
      description: pharmacy.description,
      services: pharmacy.services,
      socialMedia: pharmacy.socialMedia,
      website: pharmacy.website,
      averageRating: pharmacy.averageRating,
      isActive: pharmacy.isActive,
      location: pharmacy.location,
    };

    res.status(200).json(publicDetails);
  } catch (error) {
    console.log("error in getPharmacyDetails controller ", error);
    res.status(500).json({ error: error.message });
  }
};

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
    }).select('name location _id'); // ✅ 

    res.status(200).json(nearbyPharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
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
exports.getPharmacyMedicines = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    const pharmacy = await Pharmacy.findById(pharmacyId)
      .populate({
        path: 'medicines.medicineId',
        select: 'name imageUrl description category', // رجّع بس الحقول المهمة
      });

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    res.status(200).json({
      pharmacyId: pharmacy._id,
      medicines: pharmacy.medicines.map(med => ({
        medicineId: med.medicineId?._id,
        name: med.medicineId?.name,
        imageUrl: med.medicineId?.imageUrl,
        description: med.medicineId?.description,
        category: med.medicineId?.category,
        quantity: med.quantity,
        price: med.price,
      })),
    });
  } catch (error) {
    console.error('Error fetching pharmacy medicines:', error);
    res.status(500).json({ error: 'خطأ أثناء جلب الأدوية من الصيدلية' });
  }
};
exports.searchMedicineInPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'يرجى تحديد اسم الدواء للبحث' });
    }

    const pharmacy = await Pharmacy.findById(pharmacyId).populate({
      path: 'medicines.medicineId',
      select: 'name imageUrl',
      match: {
        name: { $regex: name, $options: 'i' }, // بحث غير حساس لحالة الأحرف
      },
    });

    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية' });
    }

    // استخراج الأدوية اللي تم مطابقة اسمها
    const matchedMedicines = pharmacy.medicines
      .filter(med => med.medicineId) // لأن populate يرجع null لو ما طابق
      .map(med => ({
        id: med.medicineId._id,
        name: med.medicineId.name,
        imageUrl: med.medicineId.imageUrl,
        price: med.price,
      }));

    res.status(200).json({ medicines: matchedMedicines });
  } catch (error) {
    console.error('خطأ أثناء البحث عن دواء في صيدلية:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
  }
};
 

// exports.getPharmacyMedicines = async (req, res) => {
//   const { pharmacyId } = req.params;

//   try {
//     const pharmacy = await Pharmacy.findById(pharmacyId)
//       .populate({
//         path: 'medicines.medicineId',
//         select: 'name imageUrl description category price',
//       })
//       .exec();

//     if (!pharmacy) {
//       return res.status(404).json({ error: 'الصيدلية غير موجودة' });
//     }

//     const medicines = pharmacy.medicines.map(medicine => ({
//       medicineId: medicine.medicineId._id,
//       name: medicine.medicineId.name,
//       imageUrl: medicine.medicineId.imageUrl,
//       description: medicine.medicineId.description,
//       category: medicine.medicineId.category,
//       quantity: medicine.quantity,
//       price: medicine.price,
//     }));

//     res.status(200).json({
//       pharmacyId: pharmacy._id,
//       pharmacyName: pharmacy.name,
//       medicines,
//       totalMedicines: medicines.length,
//     });
//   } catch (error) {
//     console.error('خطأ بجلب أدوية الصيدلية:', error);
//     res.status(500).json({ error: 'حدث خطأ أثناء جلب أدوية الصيدلية' });
//   }
// };

exports.getPharmacyNamefromcart= async (req, res) => {
  try {
    // جلب معرف المستخدم من التوكن (يتم إضافته بواسطة authMiddleware)
    const userId = req.user.id;

    // البحث عن السلة الخاصة بالمستخدم
    const cart = await Cart.findOne({ userId });

    // التحقق مما إذا كانت السلة موجودة
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'السلة فارغة أو غير موجودة' });
    }

    // استخراج معرفات الصيدليات من عناصر السلة
    const pharmacyIds = [...new Set(cart.items.map(item => item.pharmacyId.toString()))];

    // جلب أسماء الصيدليات بناءً على المعرفات
    const pharmacies = await Pharmacy.find(
      { _id: { $in: pharmacyIds } },
      { name: 1, _id: 0 } // نختار حقل الاسم فقط
    );

    // تحويل النتيجة إلى مصفوفة تحتوي على الأسماء فقط
    const pharmacyNames = pharmacies.map(pharmacy => pharmacy.name);

    // إرجاع أسماء الصيدليات
    res.status(200).json({
      message: 'تم جلب أسماء الصيدليات بنجاح',
      pharmacies: pharmacyNames,
    });
  } catch (error) {
    console.error('خطأ في جلب أسماء الصيدليات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}