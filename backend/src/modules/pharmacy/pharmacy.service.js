// src/modules/pharmacy/pharmacy.service.js

const mongoose = require('mongoose');
const Pharmacy = require('./Pharmacy.model');
const Product = require('../product/Product.model');
const User = require('../user/User.model');
const Order = require('../order/Order.model');
const Cart = require('../cart/Cart.model');
const Category = require('../category/Category.model');

const pharmacyService = {

  /**
   * إنشاء صيدلية جديدة.
   * @param {string} userId - معرّف المستخدم.
   * @param {object} pharmacyData - بيانات الصيدلية.
   * @returns {Promise<object>} - الصيدلية التي تم إنشاؤها.
   */
  async createNewPharmacy(userId, pharmacyData) {
    const { name, address, location, phone, openingHours, workingDays, imageUrl, description, services, socialMedia, website, medicines } = pharmacyData;
    const pharmacy = new Pharmacy({
      userId: userId,
      name,
      address,
      location: { type: 'Point', coordinates: location.coordinates },
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
    return pharmacy;
  },

  /**
   * تحديث بيانات الصيدلية.
   * @param {string} userId - معرّف مستخدم الصيدلية.
   * @param {object} updateData - البيانات الجديدة.
   * @returns {Promise<object>} - الصيدلية المحدثة.
   */
  async updatePharmacyByUserId(userId, updateData) {
    const { name, address, location, phone, openingHours, workingDays, imageUrl, description, services, socialMedia, website, medicines } = updateData;
    const updates = { $set: {} };
    if (name) updates.$set.name = name;
    if (address) updates.$set.address = address;
    if (location && location.coordinates) updates.$set.location = { type: 'Point', coordinates: location.coordinates };
    if (phone) updates.$set.phone = phone;
    if (workingDays) updates.$set.workingDays = workingDays;
    if (imageUrl) updates.$set.imageUrl = imageUrl;
    if (description) updates.$set.description = description;
    if (services) updates.$set.services = services;
    if (socialMedia) updates.$set.socialMedia = socialMedia;
    if (website) updates.$set.website = website;
    if (medicines) updates.$set.medicines = medicines;
    if (openingHours) {
      if (openingHours.morning?.from) updates.$set['openingHours.morning.from'] = openingHours.morning.from;
      if (openingHours.morning?.to) updates.$set['openingHours.morning.to'] = openingHours.morning.to;
      if (openingHours.evening?.from) updates.$set['openingHours.evening.from'] = openingHours.evening.from;
      if (openingHours.evening?.to) updates.$set['openingHours.evening.to'] = openingHours.evening.to;
    }
    return await Pharmacy.findOneAndUpdate({ userId: userId }, updates, { new: true });
  },

  /**
   * جلب جميع الصيدليات النشطة.
   * @returns {Promise<Array>} - مصفوفة من الصيدليات.
   */
  async findAllActivePharmacies() {
    return await Pharmacy.find({ isActive: true }).select('name address location phone openingHours workingDays imageUrl averageRating services');
  },

  /**
   * جلب بيانات صيدلية مستخدم معين.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<object|null>} - كائن الصيدلية أو null.
   */
  async findPharmacyByUserId(userId) {
    return await Pharmacy.findOne({ userId }).populate({ path: 'reviews.userId', select: 'name email' }).lean();
  },

  /**
   * جلب طلبات صيدلية مستخدم معين.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<Array>} - مصفوفة من الطلبات.
   */
  async findOrdersByPharmacyUserId(userId) {
    const pharmacy = await Pharmacy.findOne({ userId });
    if (!pharmacy) {
      throw new Error('لم يتم العثور على صيدلية لهذا المستخدم');
    }
    return await Order.find({ pharmacyId: pharmacy._id }).populate('userId', 'name email').populate('items.productId', 'name price').sort({ createdAt: -1 });
  },

  /**
   * تقييم صيدلية.
   * @param {string} pharmacyId - معرّف الصيدلية.
   * @param {string} userId - معرّف المستخدم.
   * @param {number} rating - التقييم.
   * @returns {Promise<object>} - الصيدلية بعد التقييم.
   */
  async ratePharmacyById(pharmacyId, userId, rating) {
    if (!rating || rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error('Pharmacy not found');
    }
    const existingReview = pharmacy.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) {
      throw new Error('You have already rated this pharmacy');
    }
    pharmacy.reviews.push({ userId, rating });
    pharmacy.calculateAverageRating();
    await pharmacy.save();
    return pharmacy;
  },

  /**
   * التحقق مما إذا كان المستخدم يملك صيدلية.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<object|null>} - كائن الصيدلية أو null.
   */
  async checkUserPharmacy(userId) {
    return await Pharmacy.findOne({ userId });
  },

  /**
   * جلب التفاصيل العامة للصيدلية.
   * @param {string} pharmacyId - معرّف الصيدلية.
   * @returns {Promise<object|null>} - كائن الصيدلية أو null.
   */
  async findPharmacyDetailsById(pharmacyId) {
    return await Pharmacy.findById(pharmacyId).lean();
  },

  /**
   * إضافة منتج إلى قائمة أدوية الصيدلية.
   * @param {string} userId - معرّف مستخدم الصيدلية.
   * @param {string} productId - معرّف المنتج.
   * @param {number} quantity - الكمية.
   * @param {number} price - السعر.
   * @returns {Promise<object>} - الصيدلية المحدثة.
   */
  async addProductToPharmacyStock(userId, productId, quantity, price) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
    }
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    const pharmacy = await Pharmacy.findOne({ userId: userId });
    if (!pharmacy) {
      throw new Error('Pharmacy not found');
    }
    const existingProduct = pharmacy.medicines.find((p) => p.medicineId.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
      existingProduct.price = price;
    } else {
      pharmacy.medicines.push({ medicineId: productId, quantity, price });
    }
    await pharmacy.save();
    return pharmacy;
  },

  /**
   * البحث عن الصيدليات القريبة.
   * @param {number} longitude - خط الطول.
   * @param {number} latitude - خط العرض.
   * @param {number} maxDistance - المسافة القصوى.
   * @returns {Promise<Array>} - مصفوفة من الصيدليات القريبة.
   */
  async findNearbyPharmacies(longitude, latitude, maxDistance) {
    if (!longitude || !latitude) {
        throw new Error('Longitude and latitude are required');
    }
    return await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('name location _id');
  },

  /**
   * إنشاء منتج وإضافته إلى الصيدلية.
   * @param {string} userId - معرّف المستخدم.
   * @param {object} productData - بيانات المنتج.
   * @returns {Promise<{product: object, pharmacy: object}>} - المنتج والصيدلية.
   */
  async createProductAndAddToPharmacy(userId, productData) {
    const { name, type, categoryName, sub_category, brand, description, manufacturer, imageUrl, price } = productData;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      throw new Error('Category not found');
    }
    const newProduct = new Product({
      name, type, category: category._id, sub_category, brand, description, manufacturer, imageUrl, price,
      createdBy: userId, isAdminCreated: user.type === 'admin',
    });
    await newProduct.save();

    let pharmacy = await Pharmacy.findOne({ userId: userId });
    if (!pharmacy) {
      pharmacy = new Pharmacy({
        userId: userId,
        medicines: [{ medicineId: newProduct._id, quantity: 1, price: price }],
      });
    } else {
      pharmacy.medicines.push({ medicineId: newProduct._id, quantity: 1, price: price });
    }
    await pharmacy.save();
    return { product: newProduct, pharmacy: pharmacy };
  },

  /**
   * جلب أدوية صيدلية معينة.
   * @param {string} pharmacyId - معرّف الصيدلية.
   * @returns {Promise<object|null>} - كائن الصيدلية مع الأدوية.
   */
  async findPharmacyMedicines(pharmacyId) {
    return await Pharmacy.findById(pharmacyId).populate({ path: 'medicines.medicineId', select: 'name imageUrl description category' });
  },

  /**
   * البحث عن دواء في صيدلية معينة.
   * @param {string} pharmacyId - معرّف الصيدلية.
   * @param {string} medicineName - اسم الدواء.
   * @returns {Promise<Array>} - مصفوفة من الأدوية المطابقة.
   */
  async searchMedicineInPharmacyById(pharmacyId, medicineName) {
    if (!medicineName) {
        throw new Error('يرجى تحديد اسم الدواء للبحث');
    }
    const pharmacy = await Pharmacy.findById(pharmacyId).populate({
      path: 'medicines.medicineId',
      select: 'name imageUrl',
      match: { name: { $regex: medicineName, $options: 'i' } },
    });
    if (!pharmacy) {
      throw new Error('لم يتم العثور على صيدلية');
    }
    return pharmacy.medicines.filter(med => med.medicineId).map(med => ({
        id: med.medicineId._id,
        name: med.medicineId.name,
        imageUrl: med.medicineId.imageUrl,
        price: med.price,
      }));
  },

  /**
   * جلب أسماء الصيدليات من سلة التسوق للمستخدم.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<Array>} - مصفوفة من أسماء الصيدليات.
   */
  async getPharmacyNamesFromCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new Error('السلة فارغة أو غير موجودة');
    }
    const pharmacyIds = [...new Set(cart.items.map(item => item.pharmacyId.toString()))];
    const pharmacies = await Pharmacy.find({ _id: { $in: pharmacyIds } }, { name: 1, _id: 0 });
    return pharmacies.map(pharmacy => pharmacy.name);
  }
};

module.exports = pharmacyService;