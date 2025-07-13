const mongoose = require('mongoose');

const isOwner = (Model, ownerField = 'userId') => {
    return async (req, res, next) => {
        try {
            // التحقق من صحة ID قبل البحث في قاعدة البيانات
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid ID format' });
            }

            // البحث عن العنصر في قاعدة البيانات
            const item = await Model.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            // التحقق من ملكية المستخدم للعنصر
            if (item[ownerField]?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: `Forbidden: You do not own this ${Model.modelName}` });
            }

            next(); // السماح بمتابعة الطلب
        } catch (err) {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    };
};

module.exports = isOwner;
