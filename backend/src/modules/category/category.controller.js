
const categoryService = require('./category.service');

exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = await categoryService.createNewCategory({ name, image });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    const statusCode = error.message.includes('required') || error.message.includes('exists') ? 400 : 500;
    if (statusCode === 500) {
      res.status(500).json({ message: 'Failed to create category', error: error.message });
    } else {
      res.status(statusCode).json({ message: error.message });
    }
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = await categoryService.updateCategoryById(req.params.id, { name, image });
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.findAllCategories();
    res.status(200).json({ message: 'Categories retrieved successfully', categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve categories', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.findCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category retrieved successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve category', error: error.message });
  }
};

exports.searchCategory = async (req, res) => {
  try {
    const category = await categoryService.findCategoryByName(req.params.name);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category found successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search for category', error: error.message });
  }
};

exports.deleteCategoryById = async (req, res) => {
  try {
    const category = await categoryService.deleteCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

exports.deleteCategoryByName = async (req, res) => {
  try {
    const category = await categoryService.deleteCategoryByName(req.params.name);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await categoryService.findProductsByCategoryId(req.params.categoryId);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    if (error.message.includes('required')) {
      return res.status(400).json({ message: 'Category ID is required in the URL parameters' });
    }
    res.status(500).json({
      message: 'Failed to fetch products by category',
      error: error.message 
    });
  }
};