const mongoose = require('mongoose');

const isOwner = (Model, ownerField = 'userId') => {
    return async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid ID format' });
            }

            const item = await Model.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            if (item[ownerField]?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: `Forbidden: You do not own this ${Model.modelName}` });
            }

            next(); 
        } catch (err) {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    };
};

module.exports = isOwner;
