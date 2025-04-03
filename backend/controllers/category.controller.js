const Category = require('../models/Category');
const slugify = require('slugify');

// إنشاء فئة جديدة
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name, image });
    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// تحديث فئة
exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

// جلب جميع الفئات
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ message: 'Categories retrieved successfully', categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve categories', error: error.message });
  }
};

// جلب فئة واحدة
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category retrieved successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve category', error: error.message });
  }
};

// البحث عن فئة بالاسم (تحويل الاسم إلى slug)
exports.searchCategory = async (req, res) => {
  try {
    const slug = slugify(req.params.name, { lower: true });
    const category = await Category.findOne({ slug });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category found successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search for category', error: error.message });
  }
};

// حذف فئة بالـ ID
exports.deleteCategoryById = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

// حذف فئة بالاسم
exports.deleteCategoryByName = async (req, res) => {
  try {
    const slug = slugify(req.params.name, { lower: true });
    const category = await Category.findOneAndDelete({ slug });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};
