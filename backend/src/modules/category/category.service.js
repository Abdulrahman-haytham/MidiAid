
const Category = require('./Category.model');
const slugify = require('slugify');
const Product = require('../product/Product.model'); 

const categoryService = {
  

  async createNewCategory(categoryData) {
    const { name, image } = categoryData;
    if (!name) throw new Error('Category name is required');

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) throw new Error('Category already exists');

    const category = new Category({ name, image });
    await category.save();
    return category;
  },

 
  async updateCategoryById(categoryId, updateData) {
    const { name, image } = updateData;
    const category = await Category.findById(categoryId);

    if (!category) throw new Error('Category not found');

    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();
    return category;
  },


  async findAllCategories() {
    return await Category.find();
  },

 
  async findCategoryById(categoryId) {
    return await Category.findById(categoryId);
  },

  
  async findCategoryByName(name) {
    const slug = slugify(name, { lower: true });
    return await Category.findOne({ slug });
  },

  async deleteCategoryById(categoryId) {
    return await Category.findByIdAndDelete(categoryId);
  },

  
  async deleteCategoryByName(name) {
    const slug = slugify(name, { lower: true });
    return await Category.findOneAndDelete({ slug });
  },

 
  async findProductsByCategoryId(categoryId) {
    if (!categoryId) {
      throw new Error('Category ID is required in the URL parameters');
    }
    return await Product.find({ category: categoryId });
  }
};

module.exports = categoryService;