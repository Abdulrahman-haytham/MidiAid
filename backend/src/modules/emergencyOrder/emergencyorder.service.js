// src/modules/emergencyOrder/emergencyorder.service.js

const EmergencyOrder = require('./EmergencyOrder.model');

const emergencyOrderService = {
  
  /**
   * إنشاء طلب إسعافي جديد.
   * @param {object} orderData - بيانات الطلب.
   * @param {Array<string>} recipientPharmacyIds - معرفات الصيدليات المستهدفة.
   * @returns {Promise<object>} - الطلب الذي تم إنشاؤه.
   */
  async createOrder(orderData, recipientPharmacyIds = []) {
    const newOrder = new EmergencyOrder({
      ...orderData,
      recipientPharmacies: recipientPharmacyIds, // ✅ تحسين: إضافة الصيدليات المستهدفة لتحسين البحث لاحقاً
    });
    await newOrder.save();
    return newOrder;
  },

  /**
   * جلب طلب إسعافي معين بواسطة الـ ID.
   * @param {string} orderId - معرّف الطلب.
   * @returns {Promise<object|null>} - كائن الطلب أو null.
   */
  async findOrderById(orderId) {
    // لا تغيير هنا، الكود الأصلي جيد
    return await EmergencyOrder.findById(orderId)
      .populate('userId', 'name email profilePicture')
      .populate('acceptedPharmacyId', 'name location');
  },

  /**
   * جلب جميع طلبات الإسعاف للمستخدم.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<Array>} - مصفوفة من الطلبات.
   */
  async findOrdersByUserId(userId) {
    // لا تغيير هنا، الكود الأصلي جيد
    return await EmergencyOrder.find({ userId })
      .populate('acceptedPharmacyId', 'name location')
      .populate('pharmacyResponses.pharmacyId', 'name');
  },

  /**
   * تسجيل رد الصيدلية على الطلب.
   * @param {string} orderId - معرّف الطلب.
   * @param {string} pharmacyId - معرّف الصيدلية التي ترد.
   * @param {object} responseData - بيانات الرد { response, rejectionReason }.
   * @returns {Promise<object>} - الطلب المحدث.
   */
  async recordPharmacyResponse(orderId, pharmacyId, responseData) {
    const { response, rejectionReason } = responseData;
    
    // ✅ تحسين: استخدام findOneAndUpdate لعملية ذرية (atomic) وأكثر كفاءة
    const update = {
      $push: {
        pharmacyResponses: {
          pharmacyId,
          response,
          rejectionReason,
          responseTime: new Date(),
        },
      },
    };

    // ✅ تحسين: تبسيط منطق تحديث الحالة
    if (response === 'accepted') {
      update.status = 'accepted';
      update.acceptedPharmacyId = pharmacyId;
    }

    const order = await EmergencyOrder.findOneAndUpdate({ _id: orderId, status: 'pending' }, update, { new: true });

    if (!order) {
      // قد يكون الطلب غير موجود، أو تم قبوله بالفعل، أو انتهى وقته
      throw new Error('Order not found, already accepted, or has timed out.');
    }
    
    return order;
  },

  /**
   * إلغاء طلب إسعافي.
   * @param {string} orderId - معرّف الطلب.
   * @param {string} userId - معرّف المستخدم المالك للطلب.
   * @returns {Promise<object>} - الطلب الملغى.
   */
  async cancelOrder(orderId, userId) {
    // ✅ تحسين: استخدام findOneAndUpdate للتحقق من الملكية والتحديث في عملية واحدة
    const order = await EmergencyOrder.findOneAndUpdate(
      { _id: orderId, userId: userId, status: { $in: ['pending', 'no_response'] } }, // يمكن فقط إلغاء الطلبات المعلقة
      { status: 'canceled' },
      { new: true }
    );

    if (!order) {
      // إما أن الطلب غير موجود، أو لا يملكه المستخدم، أو حالته لم تعد تسمح بالإلغاء
      throw new Error('Order not found, not owned by user, or can no longer be canceled.');
    }
    return order;
  },

  /**
   * فحص الطلبات التي انتهى وقتها (للتشغيل كمهمة مجدولة).
   */
  async processOrderTimeouts() {
    const currentTime = new Date();
    
    // ✅ تحسين: استخدام updateMany لتحديث كل الطلبات المنتهية في استعلام واحد
    const result = await EmergencyOrder.updateMany(
      {
        status: 'pending',
        responseTimeout: { $lt: currentTime },
      },
      {
        // ✅ تحسين: تغيير الحالة إلى no_response بدلاً من timed_out لتعكس عدم وجود ردود مقبولة
        status: 'no_response',
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Updated ${result.modifiedCount} orders to 'no_response' due to timeout.`);
    }
  },

  /**
   * جلب جميع الطلبات المرسلة لصيدلية معينة.
   * @param {string} pharmacyId - معرّف الصيدلية.
   * @returns {Promise<Array>} - مصفوفة من الطلبات.
   */
  async findOrdersForPharmacy(pharmacyId) {
    // ✅ تحسين: البحث باستخدام الحقل الجديد recipientPharmacies لسرعة أكبر
    // هذا يتطلب أن يتم تحديد الصيدليات المستهدفة عند إنشاء الطلب
    return await EmergencyOrder.find({
      recipientPharmacies: pharmacyId,
      status: 'pending', // عرض الطلبات المعلقة فقط التي تحتاج إلى رد
    })
      .populate('userId', 'name email profilePicture')
      .sort({ priority: -1, createdAt: 1 }); // ترتيب حسب الأولوية ثم الأقدم
  }
};

module.exports = emergencyOrderService;