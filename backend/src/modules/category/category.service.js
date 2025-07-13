// src/modules/category/category.service.js

const Category = require('./Category.model');
const slugify = require('slugify');
const Product = require('../product/Product.model'); // المسار الصحيح غالباً ../product/Product.model

const categoryService = {
  
  /**
   * إنشاء فئة جديدة.
   * @param {object} categoryData - بيانات الفئة { name, image }.
   * @returns {Promise<object>} - الفئة التي تم إنشاؤها.
   */
  async createNewCategory(categoryData) {
    const { name, image } = categoryData;
    if (!name) throw new Error('Category name is required');

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) throw new Error('Category already exists');

    const category = new Category({ name, image });
    await category.save();
    return category;
  },

  /**
   * تحديث فئة موجودة.
   * @param {string} categoryId - معرّف الفئة.
   * @param {object} updateData - البيانات الجديدة { name, image }.
   * @returns {Promise<object>} - الفئة المحدثة.
   */
  async updateCategoryById(categoryId, updateData) {
    const { name, image } = updateData;
    const category = await Category.findById(categoryId);

    if (!category) throw new Error('Category not found');

    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();
    return category;
  },

  /**
   * جلب جميع الفئات.
   * @returns {Promise<Array>} - مصفوفة من الفئات.
   */
  async findAllCategories() {
    return await Category.find();
  },

  /**
   * جلب فئة واحدة بواسطة الـ ID.
   * @param {string} categoryId - معرّف الفئة.
   * @returns {Promise<object|null>} - كائن الفئة أو null.
   */
  async findCategoryById(categoryId) {
    return await Category.findById(categoryId);
  },

  /**
   * البحث عن فئة بواسطة الاسم (slug).
   * @param {string} name - اسم الفئة.
   * @returns {Promise<object|null>} - كائن الفئة أو null.
   */
  async findCategoryByName(name) {
    const slug = slugify(name, { lower: true });
    return await Category.findOne({ slug });
  },

  /**
   * حذف فئة بواسطة الـ ID.
   * @param {string} categoryId - معرّف الفئة.
   * @returns {Promise<object|null>} - الفئة المحذوفة أو null.
   */
  async deleteCategoryById(categoryId) {
    return await Category.findByIdAndDelete(categoryId);
  },

  /**
   * حذف فئة بواسطة الاسم (slug).
   * @param {string} name - اسم الفئة.
   * @returns {Promise<object|null>} - الفئة المحذوفة أو null.
   */
  async deleteCategoryByName(name) {
    const slug = slugify(name, { lower: true });
    return await Category.findOneAndDelete({ slug });
  },

  /**
   * جلب المنتجات التي تنتمي إلى فئة معينة.
   * @param {string} categoryId - معرّف الفئة.
   * @returns {Promise<Array>} - مصفوفة من المنتجات.
   */
  async findProductsByCategoryId(categoryId) {
    if (!categoryId) {
      throw new Error('Category ID is required in the URL parameters');
    }
    return await Product.find({ category: categoryId });
  }
};

module.exports = categoryService;