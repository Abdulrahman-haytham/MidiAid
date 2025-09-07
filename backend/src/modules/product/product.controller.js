// src/modules/product/product.controller.js

const productService = require('./product.service');
const Product=require('./Product.model');

exports.createProduct = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required: User not found' });
    }
    const createdProduct = await productService.createNewProduct(user, req.body);
    res.status(201).json({ message: 'Product created successfully', product: createdProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    const statusCode = error.message.includes('required') || error.message.includes('exists') || error.message.includes('not found') ? 400 : 500;
    if(statusCode === 500) {
        res.status(500).json({ message: 'Failed to create product', error: error.message });
    } else {
        res.status(statusCode).json({ message: error.message });
    }
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    console.log("DEBUG: req.user object is:", req.user);
    let products;
    const user = req.user;
    console.log(req.body)
    if (user) {
      if (user.role === 'admin' || user.role === 'user') {
        products = await Product.find();
      } else if (user.role === 'pharmacist') {
        products = await Product.find({
          $or: [{ isAdminCreated: true }, { createdBy: user._id }],
        });
      } else {
        return res.status(403).json({ message: 'Access denied. Invalid user role.' });
      }
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product retrieved successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProductById(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

exports.searchProductBySlug = async (req, res) => {
  try {
    const product = await productService.findProductBySlug(req.params.name);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product found successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search for product', error: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const products = await productService.getSearchSuggestions(req.query.query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const result = await productService.toggleProductFavorite(user, req.params.productId);
    res.status(200).json(result);
  } catch (error) {
    if(error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getFavoriteProducts = async (req, res) => {
  try {
    const favoriteProducts = await productService.findFavoriteProducts(req.user.id);
    res.status(200).json({ favorites: favoriteProducts });
  } catch (error) {
    if(error.message.includes('المفضلة غير صالحة')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'حدث خطأ ما', error: error.message });
  }
};

exports.searchProductsByLocation = async (req, res) => {
  try {
    const responseData = await productService.searchByLocation(req.user, req.query.productName);
    const response = {
      success: true,
      message: 'Nearby products found successfully',
      data: responseData,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in searchProductsByLocation:', error);
    const statusCode = error.message.includes('required') ? 400 : 404;
    if (statusCode === 500) {
        res.status(500).json({ success: false, message: 'Failed to search for products', error: error.message });
    } else {
        res.status(statusCode).json({ success: false, message: error.message });
    }
  }
};

exports.searchProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { q } = req.query; // نص البحث بيجي من ?q=

    if (!q) {
      return res.status(400).json({ message: "يرجى إدخال كلمة للبحث" });
    }

    const products = await productService.searchProducts(categoryId, q);

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        results: 0,
        data: [],
        message: "لا يوجد منتجات مطابقة",
      });
    }

    return res.status(200).json({
      success: true,
      results: products.length,
      data: products,
      message: "تم العثور على المنتجات بنجاح",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

