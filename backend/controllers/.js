const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');
const Product = require('../models/Product');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const slugify = require('slugify');
   
const Order = require('../models/Order');

   


/**
 * @desc    Create a new pharmacy
 * @route   POST /api/pharmacies
 * @access  Private
 */
exports.createPharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      address,
      location,
      phone,
      openingHours,
      workingDays, 
      imageUrl,
      description,
      services,
      socialMedia,
      website,
      medicines,
    } = req.body;

    const pharmacy = new Pharmacy({
      userId: req.user.id,
      name,
      address,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      phone,
      openingHours,
      workingDays, 
      imageUrl,
      description,
      services,
      socialMedia,
      website,
      medicines,
    });

    await pharmacy.save();
    res.status(201).json({ message: 'Pharmacy created successfully', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};



exports.updatePharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const userId = req.user.id;

    const {
      name,
      address,
      location,
      phone,
      openingHours,
      workingDays, 
      imageUrl,
      description,
      services,
      socialMedia,
      website,
      medicines,
    } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (location && location.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }
    if (phone) updates.phone = phone;
    if (openingHours) updates.openingHours = openingHours;
    if (workingDays) updates.workingDays = workingDays;  
    if (imageUrl) updates.imageUrl = imageUrl;
    if (description) updates.description = description;
    if (services) updates.services = services;
    if (socialMedia) updates.socialMedia = socialMedia;
    if (website) updates.website = website;
    if (medicines) updates.medicines = medicines;

    // البحث عن الصيدلية بناءً على userId فقط
    const updatedPharmacy = await Pharmacy.findOneAndUpdate(
      { userId: userId },  // شرط البحث عن الصيدلية بناءً على الـ userId
      { $set: updates }, // تحديث البيانات
      { new: true }
    );

    if (!updatedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found or unauthorized' });
    }

    res.status(200).json({ message: 'Pharmacy updated successfully', pharmacy: updatedPharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};



exports.getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id })
      .populate({
        path: 'medicines.medicineId',
        select: 'name imageUrl description category',
      })
      .populate({
        path: 'reviews.userId',
        select: 'name email',
      })
      .exec();

    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية لهذا المستخدم' });
    }

    // احسب عدد الأدوية وعدد التقييمات
    const medicineCount = pharmacy.medicines.length;
    const reviewCount = pharmacy.reviews.length;

    // احسب وصف التقييم اللفظي
    const avg = pharmacy.averageRating;
    let ratingLabel = '';
    if (avg >= 4.5) ratingLabel = 'ممتاز';
    else if (avg >= 3.5) ratingLabel = 'جيد جداً';
    else if (avg >= 2.5) ratingLabel = 'جيد';
    else if (avg > 0) ratingLabel = 'ضعيف';
    else ratingLabel = 'لا يوجد تقييم بعد';

    res.status(200).json({
      pharmacy: {
        ...pharmacy.toObject(),
        medicineCount,
        reviewCount,
        ratingLabel,
        createdAt: pharmacy.createdAt,
        updatedAt: pharmacy.updatedAt,
        isActive: pharmacy.isActive,
      },
    });
  } catch (error) {
    console.error('خطأ بجلب بيانات الصيدلية:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الصيدلية' });
  }
};

/**
 * @desc    Get all pharmacies (without sensitive data)
 * @route   GET /api/pharmacies
 * @access  Public
 */
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true }).select(
      'name address location phone openingHours workingDays imageUrl averageRating services'
    );
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get full pharmacy details (including products and reviews)
 * @route   GET /api/pharmacies/details
 * @access  Private
 */
exports.getPharmacyDetails = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    const pharmacy = await Pharmacy.findById(pharmacyId).lean(); // lean لتحصل على نسخة عادية من الـ object

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    // احذف المنتجات من النتيجة
    delete pharmacy.medicines;

    res.status(200).json(pharmacy);
  } catch (error) {
    console.log("error in getPharmacyDetails controller ", error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * @desc    Add a rating to a pharmacy (without comments)
 * @route   POST /api/pharmacies/:id/rate
 * @access  Private
 */
exports.ratePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const existingReview = pharmacy.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already rated this pharmacy' });
    }

    pharmacy.reviews.push({ userId, rating });
    pharmacy.calculateAverageRating();
    await pharmacy.save();

    res.status(201).json({ message: 'Rating added successfully', averageRating: pharmacy.averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Add a product to the pharmacy
 * @route   POST /api/pharmacies/add-product
 * @access  Private
 */
exports.addProductToPharmacy = async (req, res) => {
  const { productId, quantity, price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const existingProduct = pharmacy.medicines.find((p) => p.medicineId.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
      existingProduct.price = price;
    } else {
      pharmacy.medicines.push({ medicineId: productId, quantity, price });
    }

    await pharmacy.save();
    res.status(200).json({ message: 'Product added successfully', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyPharmacyOrders = async (req, res) => {
  try {
    // نجيب الصيدلية المرتبطة بالمستخدم الحالي
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });

    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية لهذا المستخدم' });
    }

    // نجيب كل الطلبات المرتبطة بهي الصيدلية
    const orders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('userId', 'name email') // معلومات المستخدم يلي عامل الطلب
      .populate('items.productId', 'name price') // معلومات المنتجات داخل الطلب
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات' });
  }
};
/**
 * @desc    Find nearby pharmacies based on geolocation
 * @route   GET /api/pharmacies/nearby
 * @access  Public
 */
exports.findNearbyPharmacies = async (req, res) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Longitude and latitude are required' });
  }

  try {
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('name location _id'); // ✅ 

    res.status(200).json(nearbyPharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/pharmacies/create-product
 * @access  Private
 */
exports.createProduct = async (req, res) => {
  const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newProduct = new Product({
      name,
      type,
      category,
      sub_category,
      brand,
      description,
      manufacturer,
      imageUrl,
      price,
      createdBy: req.user.id,
      isAdminCreated: user.role === 'admin',
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in createProduct controller ", error)
  }
};



exports.getPharmacyMedicines = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    const pharmacy = await Pharmacy.findById(pharmacyId)
      .populate({
        path: 'medicines.medicineId',
        select: 'name imageUrl description category', // رجّع بس الحقول المهمة
      });

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    res.status(200).json({
      pharmacyId: pharmacy._id,
      medicines: pharmacy.medicines.map(med => ({
        medicineId: med.medicineId?._id,
        name: med.medicineId?.name,
        imageUrl: med.medicineId?.imageUrl,
        description: med.medicineId?.description,
        category: med.medicineId?.category,
        quantity: med.quantity,
        price: med.price,
      })),
    });
  } catch (error) {
    console.error('Error fetching pharmacy medicines:', error);
    res.status(500).json({ error: 'خطأ أثناء جلب الأدوية من الصيدلية' });
  }
};

// Search products based on user's location
// exports.searchProductsByLocation = async (req, res) => {
//   try {
//     const { productName } = req.query;
//     const user = await User.findById(req.user._id);
//     if (!user || !user.location) {
//       return res.status(400).json({ success: false, message: 'User location is required' });
//     }

//     const { coordinates } = user.location;
//     const mainProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });

//     if (!mainProduct) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     const subCategory = mainProduct.sub_category;
//     const alternativeProducts = await Product.find({
//       sub_category: subCategory,
//       _id: { $ne: mainProduct._id },
//     });

//     const pharmacies = await Pharmacy.find({
//       'medicines.medicineId': { $in: [mainProduct._id, ...alternativeProducts.map(p => p._id)] },
//       location: {
//         $near: {
//           $geometry: { type: 'Point', coordinates },
//           $maxDistance: 5000,
//         },
//       },
//     }).populate('medicines.medicineId', 'name price');

//     const response = {
//       success: true,
//       message: 'Products found successfully',
//       data: {
//         mainProduct: {
//           ...mainProduct.toObject(),
//           pharmacies: pharmacies.filter(pharmacy =>
//             pharmacy.medicines.some(med => med.medicineId._id.equals(mainProduct._id))
//           ).map(pharmacy => ({
//             pharmacyId: pharmacy._id,
//             pharmacyName: pharmacy.name,
//             distance: 'Calculated by MongoDB',
//             price: pharmacy.medicines.find(med => med.medicineId._id.equals(mainProduct._id)).price,
//           })),
//         },
//         alternatives: alternativeProducts.map(product => ({
//           ...product.toObject(),
//           pharmacies: pharmacies.filter(pharmacy =>
//             pharmacy.medicines.some(med => med.medicineId._id.equals(product._id))
//           ).map(pharmacy => ({
//             pharmacyId: pharmacy._id,
//             pharmacyName: pharmacy.name,
//             distance: 'Calculated by MongoDB',
//             price: pharmacy.medicines.find(med => med.medicineId._id.equals(product._id)).price,
//           })),
//         })),
//       },
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to search for products', error: error.message });
//   }
// };

// Assume Mongoose models are imported like this:
// const User = require('../models/User');
// const Product = require('../models/Product');
// const Pharmacy = require('../models/Pharmacy');

// Also assume relevant dependencies like express or others are handled elsewhere

// exports.searchProductsByLocation = async (req, res) => {
//     try {
//         const { productName } = req.query;

//         // 1. Fetch user and validate location
//         const user = await User.findById(req.user._id);

//         if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
//             return res.status(400).json({ success: false, message: 'User location (coordinates) is required' });
//         }

//         // MongoDB stores coordinates as [longitude, latitude]
//         const userCoordinates = user.location.coordinates;

//         // 2. Find the main product
//         const mainProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });

//         if (!mainProduct) {
//             return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//         const subCategory = mainProduct.sub_category;

//         // 3. Find alternative products (only need their IDs for the pipeline)
//         const alternativeProducts = await Product.find({
//             sub_category: subCategory,
//             _id: { $ne: mainProduct._id },
//         }).select('_id name'); // Select only necessary fields to save memory/bandwidth

//         // List of all relevant product IDs (main + alternatives) for filtering in the pipeline
//         const relevantProductIds = [mainProduct._id, ...alternativeProducts.map(p => p._id)];

//         // 4. Use Aggregation Pipeline on Pharmacy collection to find nearby pharmacies selling relevant products
//         const pipeline = [
//             {
//                 // $geoNear must be the first stage in a pipeline unless it's preceded by $match, $sort, or $limit only when using a sharded collection.
//                 // It filters documents by location and calculates distance.
//                 $geoNear: {
//                     near: { type: 'Point', coordinates: userCoordinates }, // User's location
//                     distanceField: 'distance', // Output field name for distance
//                     maxDistance: 5000, // Maximum distance in meters (5 km)
//                     spherical: true, // Use spherical geometry for geographic data
//                     // We don't use a 'query' here because we need to filter on elements *within* the 'medicines' array,
//                     // which is better done after $unwind.
//                 },
//             },
//              {
//                  // Initial match: Only include pharmacies that contain at least one of the relevant product IDs
//                  // in their 'medicines' array. This is an efficient initial filter.
//                  $match: { 'medicines.medicineId': { $in: relevantProductIds } }
//              },
//             {
//                 // Deconstruct the 'medicines' array. Each element becomes a separate document.
//                 // This is necessary to filter and process individual medicine entries within a pharmacy.
//                 $unwind: '$medicines',
//             },
//             {
//                 // Match the unwound documents to keep only the ones corresponding to our relevant products.
//                 // This filters out other medicines the pharmacy might sell.
//                 $match: { 'medicines.medicineId': { $in: relevantProductIds } },
//             },
//             {
//                 // Lookup product details for the matched medicineId.
//                 // This stage joins the current documents (pharmacy+medicine entry) with the 'products' collection.
//                 $lookup: {
//                     from: 'products', // The name of the collection for the Product model (usually lowercase and plural)
//                     localField: 'medicines.medicineId', // Field from the input documents ($unwound pharmacy documents)
//                     foreignField: '_id', // Field from the 'products' collection
//                     as: 'productDetails', // Output array field name to add product details
//                 },
//             },
//             {
//                 // $lookup results in an array (though it will have at most one element here).
//                 // $unwind it to get the product document directly.
//                 $unwind: '$productDetails',
//             },
//             {
//                 // Group the documents by product ID.
//                 // This stage gathers all pharmacy entries for the same product together.
//                 $group: {
//                     _id: '$medicines.medicineId', // Grouping key: the product ID
//                     productDetails: { $first: '$productDetails' }, // Keep the product details (same for all in group)
//                     pharmacies: {
//                         // For each document in the group (each pharmacy selling this product),
//                         // push an object with pharmacy details and the price/distance for this product.
//                         $push: {
//                             pharmacyId: '$_id', // The original pharmacy _id from before unwinding
//                             pharmacyName: '$name', // Pharmacy name
//                             distance: '$distance', // The actual distance calculated by $geoNear
//                             price: '$medicines.price', // The price of THIS specific product in THIS pharmacy
//                             pharmacyLocation: '$location' // Include location if needed in response
//                         },
//                     },
//                      // Optional: Add total count of pharmacies for this product
//                      // pharmacyCount: { $sum: 1 }
//                 },
//             },
//             {
//                  // Reshape the output documents to match the desired response structure.
//                  $project: {
//                      _id: 0, // Exclude the default _id created by $group
//                      product: { // Embed product details in a 'product' object
//                          _id: '$productDetails._id',
//                          name: '$productDetails.name',
//                          // Include other product fields you need in the response
//                          type: '$productDetails.type',
//                          category: '$productDetails.category',
//                          sub_category: '$productDetails.sub_category',
//                          brand: '$productDetails.brand',
//                          description: '$productDetails.description',
//                          manufacturer: '$productDetails.manufacturer',
//                          imageUrl: '$productDetails.imageUrl',
//                          // Note: '$productDetails.price' here is the *default* price from Product model,
//                          // not the price in the specific pharmacy. The pharmacy-specific price is in the 'pharmacies' array.
//                          // If you need the default product price, include it. Otherwise, maybe exclude it to avoid confusion.
//                          // For this example, I'll include it based on your previous output structure.
//                          price: '$productDetails.price', // Default product price
//                          // Add other product details as needed
//                          createdAt: '$productDetails.createdAt',
//                          updatedAt: '$productDetails.updatedAt',
//                          slug: '$productDetails.slug',
//                          __v: '$productDetails.__v'
//                      },
//                      pharmacies: 1 // Include the array of pharmacies found for this product
//                  }
//             }
//             // Optional stages: $sort, $limit, $skip could be added here for pagination/ordering
//             // { $sort: { 'pharmacies.distance': 1 } } // Sort pharmacies *within* each product group (requires MongoDB 3.6+)
//             // { $sort: { 'product.name': 1 } } // Sort the product results themselves
//         ];

//         const productResults = await Pharmacy.aggregate(pipeline);

//         // --- Debugging Output ---
//         // This will show the exact result of the aggregation pipeline
//         console.log("Aggregation Results:", JSON.stringify(productResults, null, 2));
//         // -----------------------

//         // 5. Structure the final response based on aggregation results

//         // Find the result object for the main product
//         const mainProductResult = productResults.find(item =>
//             item.product && item.product._id && item.product._id.equals(mainProduct._id)
//         );

//         // Filter the result objects for alternative products
//         const alternativeResults = productResults.filter(item =>
//              item.product && item.product._id && !item.product._id.equals(mainProduct._id)
//         );

//         const response = {
//             success: true,
//             message: 'Products found successfully',
//             data: {
//                 // If main product wasn't found in nearby pharmacies by the pipeline,
//                 // return its details with an empty pharmacies array.
//                 mainProduct: mainProductResult || {
//                      product: mainProduct.toObject(), // Use the product object fetched initially
//                      pharmacies: [] // No nearby pharmacies found selling it via the pipeline
//                 },
//                 // Return the alternative results found by the pipeline, or an empty array
//                 // if no alternatives were found in nearby pharmacies.
//                 alternatives: alternativeResults || [],
//             },
//         };

//         res.status(200).json(response);

//     } catch (error) {
//         console.error('Error in searchProductsByLocation:', error); // Log the actual error
//         res.status(500).json({ success: false, message: 'Failed to search for products', error: error.message });
//     }
// };

// Assume Mongoose models are imported like this:
// const User = require('../models/User');
// const Product = require('../models/Product');
// const Pharmacy = require('../models/Pharmacy');

// Also assume relevant dependencies like express or others are handled elsewhere

// exports.searchProductsByLocation = async (req, res) => {
//     try {
//         const { productName } = req.query;

//         // 1. Fetch user and validate location
//         const user = await User.findById(req.user._id);

//         if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
//             return res.status(400).json({ success: false, message: 'User location (coordinates) is required' });
//         }

//         // MongoDB stores coordinates as [longitude, latitude]
//         const userCoordinates = user.location.coordinates;

//         // 2. Find the main product
//         // We still need this initially to get the _id and sub_category
//         const mainProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });

//         if (!mainProduct) {
//             return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//         const subCategory = mainProduct.sub_category;

//         // 3. Find alternative products (only need their IDs for the pipeline)
//         const alternativeProducts = await Product.find({
//             sub_category: subCategory,
//             _id: { $ne: mainProduct._id },
//         }).select('_id'); // Select only ID

//         // List of all relevant product IDs (main + alternatives) for filtering in the pipeline
//         const relevantProductIds = [mainProduct._id, ...alternativeProducts.map(p => p._id)];

//         // 4. Use Aggregation Pipeline on Pharmacy collection to find nearby pharmacies selling relevant products
//         // The pipeline's output will ONLY include products that were found in nearby pharmacies
//         const pipeline = [
//             {
//                 $geoNear: {
//                     near: { type: 'Point', coordinates: userCoordinates },
//                     distanceField: 'distance',
//                     maxDistance: 5000, // Max distance in meters
//                     spherical: true,
//                 },
//             },
//              {
//                  // Initial match for performance: only process pharmacies that *might* have one of the products
//                  $match: { 'medicines.medicineId': { $in: relevantProductIds } }
//              },
//             {
//                 // Deconstruct the medicines array
//                 $unwind: '$medicines',
//             },
//             {
//                 // Match specific medicine entries that correspond to our relevant products
//                 $match: { 'medicines.medicineId': { $in: relevantProductIds } },
//             },
//             {
//                 // Lookup product details
//                 $lookup: {
//                     from: 'products', // The name of the collection for Product model
//                     localField: 'medicines.medicineId',
//                     foreignField: '_id',
//                     as: 'productDetails',
//                 },
//             },
//             {
//                 // Unwind the product details array (should be size 1)
//                 $unwind: '$productDetails',
//             },
//             {
//                 // Group by product ID to aggregate pharmacies selling each product
//                 $group: {
//                     _id: '$medicines.medicineId', // Grouping key is the product ID
//                     // Keep the product details - they are the same for this group
//                     productDetails: { $first: '$productDetails' },
//                     // Push pharmacy details, including distance and price for this specific medicine entry
//                     pharmacies: {
//                         $push: {
//                             pharmacyId: '$_id', // The original pharmacy _id
//                             pharmacyName: '$name', // Pharmacy name
//                             distance: '$distance', // Distance calculated by $geoNear
//                             price: '$medicines.price', // Price of THIS product in THIS pharmacy
//                             pharmacyLocation: '$location' // Include location if needed
//                         },
//                     },
//                      // Optional: Add a count of pharmacies for this product
//                      // pharmacyCount: { $sum: 1 }
//                 },
//             },
//             {
//                  // Reshape the output document for each grouped product result
//                  $project: {
//                      _id: 0, // Exclude the default group _id
//                      product: { // Embed product details
//                          _id: '$productDetails._id',
//                          name: '$productDetails.name',
//                          // Add other product fields needed from productDetails
//                          type: '$productDetails.type',
//                          category: '$productDetails.category',
//                          sub_category: '$productDetails.sub_category',
//                          brand: '$productDetails.brand',
//                          description: '$productDetails.description',
//                          manufacturer: '$productDetails.manufacturer',
//                          imageUrl: '$productDetails.imageUrl',
//                          // Note: This price is from the Product model, not the pharmacy.
//                          // The pharmacy-specific price is in the 'pharmacies' array elements.
//                          price: '$productDetails.price', // Default product price
//                          createdAt: '$productDetails.createdAt',
//                          updatedAt: '$productDetails.updatedAt',
//                          slug: '$productDetails.slug',
//                          __v: '$productDetails.__v'
//                      },
//                      pharmacies: 1 // Include the array of pharmacies for this product
//                  }
//             }
//             // Add sorting stages if needed, e.g., sort products by name or sort pharmacies by distance
//             // { $sort: { 'product.name': 1 } } // Sort the main product results
//             // You cannot easily sort pharmacies *within* the group by distance in this way for the final output structure without more complex steps or post-processing.
//         ];

//         const productResults = await Pharmacy.aggregate(pipeline);

//         // --- Debugging Output ---
//         // This will show the exact result of the aggregation pipeline
//         console.log("Aggregation Results:", JSON.stringify(productResults, null, 2));
//         // -----------------------

//         // 5. Structure the final response based ONLY on the aggregation results

//         // Find the result object for the main product (if it exists in the aggregation results)
//         const mainProductResult = productResults.find(item =>
//             item.product && item.product._id && item.product._id.equals(mainProduct._id)
//         );

//         // Filter the result objects for alternative products (if they exist in the aggregation results)
//         const alternativeResults = productResults.filter(item =>
//              item.product && item.product._id && !item.product._id.equals(mainProduct._id)
//         );

//         const responseData = {}; // Object to build the data part of the response

//         // Only add the mainProduct to the response data IF it was found in nearby pharmacies by the pipeline
//         if (mainProductResult) {
//             responseData.mainProduct = mainProductResult;
//         }
//         // Note: If mainProductResult is null, the 'mainProduct' field will simply not be present in responseData.

//         // Always add the alternatives array. It will contain only results from the pipeline,
//         // and will be empty if no alternatives were found in nearby pharmacies.
//         responseData.alternatives = alternativeResults || []; // Ensure it's always an array


//         const response = {
//             success: true,
//             // You might want a more descriptive message if nothing is found, but keeping the original for now.
//             // A neutral message like "Search completed" is often good.
//             message: 'Nearby products search completed',
//             data: responseData, // This data object now only contains products found in nearby pharmacies
//         };

//         // Optional: If neither mainProduct nor any alternatives were found in nearby pharmacies,
//         // you could return a 404 status, or simply the 200 status with potentially empty 'data'.
//         // Keeping 200 OK with potentially empty data part is common.
//         // if (!responseData.mainProduct && (!responseData.alternatives || responseData.alternatives.length === 0)) {
//         //      return res.status(404).json({ success: false, message: 'No nearby pharmacies found selling this product or its alternatives.' });
//         // }


//         res.status(200).json(response);

//     } catch (error) {
//         console.error('Error in searchProductsByLocation:', error); // Log the actual error
//         res.status(500).json({ success: false, message: 'Failed to search for products', error: error.message });
//     }
// };
// Assume Mongoose models are imported like this:
// const User = require('../models/User');
// const Product = require('../models/Product');
// const Pharmacy = require('../models/Pharmacy');

// Also assume relevant dependencies like express or others are handled elsewhere