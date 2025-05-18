// controllers/product.controller.js
const Product = require('../models/Product');
const User = require('../models/user');
const mongoose = require('mongoose');
const slugify = require('slugify');
const Category=require("../models/Category")
const Pharmacy=require('../models/Pharmacy')


exports.createProduct = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Authentication required: User not found' });
  }

  try {
    const {
      name,
      type,
      categoryName,
      sub_category,
      brand,
      description,
      manufacturer,
      imageUrl,
      price
    } = req.body;


    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists with this name' });
    }


    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const foundCategory = await Category.findOne({ name: categoryName });

    if (!foundCategory) {
      return res.status(400).json({ message: `Category with name "${categoryName}" not found` });
    }


    const product = new Product({
      name,
      type,
      category: foundCategory._id, 
      sub_category,
      brand,
      description,
      manufacturer,
      imageUrl,
      price,
      createdBy: user._id, 
      isAdminCreated: user.role === 'admin',
    });


    const createdProduct = await product.save();


    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct // إرجاع المنتج الذي تم إنشاؤه بالكامل
    });

  } catch (error) {
    console.error('Error creating product:', error);

    res.status(500).json({
      message: 'Failed to create product',
      error: error.message 
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    let products;
    const user = req.user;

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

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product retrieved successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// Search for a product by slug
exports.searchProductBySlug = async (req, res) => {
  try {
    const slug = slugify(req.params.name, { lower: true });
    const product = await Product.findOne({ slug });

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
      const query = req.query.query;
      const products = await Product.find({
        name: { $regex: query, $options: 'i' } 
      }).limit(10).select('name');  // هنا نقوم بتحديد الحقل name فقط
    
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// Add product to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (user.favorites.includes(product._id)) {
      return res.status(400).json({ error: 'Product is already in favorites' });
    }

    user.favorites.push(product._id);
    await user.save();

    res.status(200).json({ message: 'Product added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle favorite (add/remove)
exports.toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const index = user.favorites.indexOf(product._id);
    let message = '';

    if (index === -1) {
      user.favorites.push(product._id);
      message = 'Product added to favorites';
    } else {
      user.favorites.splice(index, 1);
      message = 'Product removed from favorites';
    }

    await user.save();

    res.status(200).json({ message, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all favorite products for the current user
exports.getFavoriteProducts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean(); // استخدام lean لتسريع القراءة
        
        if (!user || !Array.isArray(user.favorites)) {
            return res.status(400).json({ message: 'المفضلة غير صالحة' });
        }
  
        // تصفية المعرّفات غير الصالحة قبل `populate`
        const validFavorites = user.favorites.filter(fav => mongoose.Types.ObjectId.isValid(fav));
  
        // جلب المنتجات المرتبطة بالمفضلة
        const favoriteProducts = await Product.find({ _id: { $in: validFavorites } });
  
        res.status(200).json({ favorites: favoriteProducts });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ ما', error: error.message });
    }
  }



exports.searchProductsByLocation = async (req, res) => {
    try {
        const { productName } = req.query;

        // 1. Fetch user and validate location
        const user = await User.findById(req.user._id);

        if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: 'User location (coordinates) is required' });
        }

        const userCoordinates = user.location.coordinates; // [longitude, latitude]

        // 2. Find the main product
        const mainProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });

        if (!mainProduct) {
            // If the product itself isn't found in the database, return 404 Product Not Found
            return res.status(404).json({ success: false, message: 'Product not found in the system' });
        }

        const subCategory = mainProduct.sub_category;

        // 3. Find alternative products (only need their IDs for the pipeline)
        const alternativeProducts = await Product.find({
            sub_category: subCategory,
            _id: { $ne: mainProduct._id },
        }).select('_id name');

        // List of all relevant product IDs (main + alternatives)
        const relevantProductIds = [mainProduct._id, ...alternativeProducts.map(p => p._id)];

        // 4. Aggregation Pipeline to find nearby pharmacies selling relevant products
        const pipeline = [
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: userCoordinates },
                    distanceField: 'distance',
                    maxDistance: 500000, // Max distance in meters (5 km)
                    spherical: true,
                },
            },
             {
                 // Initial match for performance
                 $match: { 'medicines.medicineId': { $in: relevantProductIds } }
             },
            {
                $unwind: '$medicines',
            },
            {
                $match: { 'medicines.medicineId': { $in: relevantProductIds } },
            },
            {
                $lookup: {
                    from: 'products', // Collection name for Product model
                    localField: 'medicines.medicineId',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            {
                $unwind: '$productDetails',
            },
            {
                $group: {
                    _id: '$medicines.medicineId', // Grouping key: product ID
                    productDetails: { $first: '$productDetails' },
                    pharmacies: {
                        $push: {
                            pharmacyId: '$_id', // Original pharmacy _id
                            pharmacyName: '$name', // Pharmacy name
                            distance: '$distance', // Distance calculated by $geoNear
                            price: '$medicines.price', // Price of THIS product in THIS pharmacy
                            pharmacyLocation: '$location' // Include location if needed
                        },
                    },
                },
            },
            {
                 $project: {
                     _id: 0,
                     product: {
                         _id: '$productDetails._id',
                         name: '$productDetails.name',
                         // Add other product fields needed
                         type: '$productDetails.type',
                         category: '$productDetails.category',
                         sub_category: '$productDetails.sub_category',
                         brand: '$productDetails.brand',
                         description: '$productDetails.description',
                         manufacturer: '$productDetails.manufacturer',
                         imageUrl: '$productDetails.imageUrl',
                         price: '$productDetails.price', // Default product price
                         createdAt: '$productDetails.createdAt',
                         updatedAt: '$productDetails.updatedAt',
                         slug: '$productDetails.slug',
                         __v: '$productDetails.__v'
                     },
                     pharmacies: 1
                 }
            }
        ];

        const productResults = await Pharmacy.aggregate(pipeline);

        // --- Debugging Output ---
        console.log("Aggregation Results:", JSON.stringify(productResults, null, 2));
        // -----------------------

        // 5. Structure the final response based on aggregation results
        // Now, if productResults is empty, we know *no* relevant products were found in nearby pharmacies

        if (!productResults || productResults.length === 0) {
             // If the aggregation pipeline returned no results, it means
             // the product or its alternatives were not found in any nearby pharmacy.
             return res.status(404).json({
                 success: false,
                 message: `No nearby pharmacies found selling "${mainProduct.name}" or its alternatives within 5 km.`
                 // Or a more general message if you prefer:
                 // message: 'No nearby pharmacies found selling the requested product or its alternatives.'
             });
        }

        // If we reach here, productResults is not empty, meaning at least one product
        // (main or alternative) was found in at least one nearby pharmacy.

        // Find the result object for the main product (if it exists in the aggregation results)
        const mainProductResult = productResults.find(item =>
            item.product && item.product._id && item.product._id.equals(mainProduct._id)
        );

        // Filter the result objects for alternative products
        const alternativeResults = productResults.filter(item =>
             item.product && item.product._id && !item.product._id.equals(mainProduct._id)
        );

        const responseData = {};

        // Add mainProduct to data IF it was found by the pipeline
        if (mainProductResult) {
            responseData.mainProduct = mainProductResult;
        }

        // Add alternatives array (will contain found alternatives or be empty if none were found by pipeline)
        responseData.alternatives = alternativeResults || [];


        const response = {
            success: true,
            // A positive message indicating that *some* results were found
            message: 'Nearby products found successfully',
            data: responseData, // Contains only products found in nearby pharmacies
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in searchProductsByLocation:', error); // Log the actual error
        res.status(500).json({ success: false, message: 'Failed to search for products', error: error.message });
    }
};
