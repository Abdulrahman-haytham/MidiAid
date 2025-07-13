// src/modules/kafuPost/kafupost.service.js

const KafuPost = require('./KafuPost.model');

const kafuPostService = {
  
  /**
   * إنشاء منشور كفو جديد.
   * @param {string} userId - معرّف المستخدم الذي أنشأ المنشور.
   * @param {object} postData - بيانات المنشور.
   * @returns {Promise<object>} - المنشور الذي تم إنشاؤه.
   */
  async createNewPost(userId, postData) {
    const { title, description, type, medicineId, pharmacyId, location, expiresInDays } = postData;
    const expiresAt = new Date(Date.now() + (expiresInDays || 3) * 24 * 60 * 60 * 1000);
    const newPost = new KafuPost({ userId, title, description, type, medicineId, pharmacyId, location, expiresAt });
    await newPost.save();
    return newPost;
  },

  /**
   * جلب جميع منشورات كفو المفتوحة.
   * @returns {Promise<Array>} - مصفوفة من المنشورات.
   */
  async findAllOpenPosts() {
    return await KafuPost.find({ status: 'Open' }).populate('userId', 'name').select('-__v');
  },

  /**
   * جلب منشورات كفو القريبة من موقع معين.
   * @param {number} lat - خط العرض.
   * @param {number} lng - خط الطول.
   * @returns {Promise<Array>} - مصفوفة من المنشورات القريبة.
   */
  async findNearbyPosts(lat, lng) {
    return await KafuPost.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: 5000 } },
      status: 'Open'
    }).populate('userId', 'name');
  },

  /**
   * قبول طلب مساعدة (كفو).
   * @param {string} postId - معرّف المنشور.
   * @param {string} helperId - معرّف المستخدم المساعد.
   * @returns {Promise<object>} - المنشور المحدث.
   */
  async acceptKafuRequest(postId, helperId) {
    const post = await KafuPost.findById(postId);
    if (!post || post.status !== 'Open') throw new Error('Request not available');
    post.helperId = helperId;
    post.status = 'In Progress';
    await post.save();
    return post;
  },

  /**
   * تحديد طلب كفو كمكتمل.
   * @param {string} postId - معرّف المنشور.
   * @param {string} helperId - معرّف المستخدم المساعد.
   * @returns {Promise<object>} - المنشور المحدث.
   */
  async completeKafuRequest(postId, helperId) {
    const post = await KafuPost.findById(postId);
    if (!post || post.status !== 'In Progress' || post.helperId.toString() !== helperId) throw new Error('Invalid request completion');
    post.status = 'Completed';
    await post.save();
    return post;
  },

  /**
   * حذف منشور كفو.
   * @param {string} postId - معرّف المنشور.
   * @param {object} user - كائن المستخدم الذي يحاول الحذف (للتحقق من الصلاحيات).
   * @returns {Promise<void>}
   */
  async deletePostById(postId, user) {
    const post = await KafuPost.findById(postId);
    if (!post || (post.userId.toString() !== user.id && user.role !== 'admin')) throw new Error('Unauthorized');
    await post.deleteOne();
  },

  /**
   * مهمة مجدولة لحذف المنشورات المنتهية الصلاحية.
   */
  async deleteExpiredPosts() {
    // إعلام: لم أغير أي شيء في منطق هذه الدالة
    await KafuPost.deleteMany({ expiresAt: { $lt: new Date() }, status: 'Open' });
  }
};

// إعلام: لم أغير أي شيء في منطق المهمة المجدولة، لكن مكانها الأفضل خارج ملف الخدمة.
// سيتم نقل هذا المنطق في قسم الاقتراحات.
setInterval(kafuPostService.deleteExpiredPosts, 24 * 60 * 60 * 1000);

module.exports = kafuPostService;