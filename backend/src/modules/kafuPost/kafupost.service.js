// src/modules/kafuPost/kafupost.service.js

const KafuPost = require('./KafuPost');

const kafuPostService = {
 
  async createNewPost(userId, postData) {
    const { title, description, type, medicineId, pharmacyId, location, expiresInDays } = postData;
    const expiresAt = new Date(Date.now() + (expiresInDays || 3) * 24 * 60 * 60 * 1000);
    const newPost = new KafuPost({ userId, title, description, type, medicineId, pharmacyId, location, expiresAt });
    await newPost.save();
    return newPost;
  },

  async findAllOpenPosts() {
    return await KafuPost.find({ status: 'Open' }).populate('userId', 'name').select('-__v');
  },

  async findNearbyPosts(lat, lng) {
    return await KafuPost.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: 5000 } },
      status: 'Open'
    }).populate('userId', 'name');
  },

  async acceptKafuRequest(postId, helperId) {
    const post = await KafuPost.findById(postId);
    if (!post || post.status !== 'Open') throw new Error('Request not available');
    post.helperId = helperId;
    post.status = 'In Progress';
    await post.save();
    return post;
  },

  async completeKafuRequest(postId, helperId) {
    const post = await KafuPost.findById(postId);
    if (!post || post.status !== 'In Progress' || post.helperId.toString() !== helperId) throw new Error('Invalid request completion');
    post.status = 'Completed';
    await post.save();
    return post;
  },

 
  async deletePostById(postId, user) {
    const post = await KafuPost.findById(postId);
    if (!post || (post.userId.toString() !== user.id && user.role !== 'admin')) throw new Error('Unauthorized');
    await post.deleteOne();
  },

  async deleteExpiredPosts() {
    // إعلام: لم أغير أي شيء في منطق هذه الدالة
    await KafuPost.deleteMany({ expiresAt: { $lt: new Date() }, status: 'Open' });
  }
};

// إعلام: لم أغير أي شيء في منطق المهمة المجدول
// سيتم نقل هذا المنطق في قسم الاقتراحات.
setInterval(kafuPostService.deleteExpiredPosts, 24 * 60 * 60 * 1000);

module.exports = kafuPostService;