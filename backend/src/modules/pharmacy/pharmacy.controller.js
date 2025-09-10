const pharmacyService = require('./pharmacy.service');
const { validationResult } = require('express-validator');

exports.createPharmacy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const pharmacy = await pharmacyService.createNewPharmacy(req.user.id, req.body);
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
    const updatedPharmacy = await pharmacyService.updatePharmacyByUserId(req.user.id, req.body);
    if (!updatedPharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found or unauthorized' });
    }
    res.status(200).json({ message: 'Pharmacy updated successfully', pharmacy: updatedPharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await pharmacyService.findAllActivePharmacies();
    const formattedPharmacies = pharmacies.map(pharmacy => ({
      ...pharmacy._doc,
      openingHours: {
        formatted: `الصباح: من ${pharmacy.openingHours.morning.from} إلى ${pharmacy.openingHours.morning.to}, المساء: من ${pharmacy.openingHours.evening.from} إلى ${pharmacy.openingHours.evening.to}`,
        raw: pharmacy.openingHours,
      },
    }));
    res.status(200).json(formattedPharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await pharmacyService.findPharmacyByUserId(req.user.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'لم يتم العثور على صيدلية لهذا المستخدم' });
    }
    const reviewCount = pharmacy.reviews.length;
    const avg = pharmacy.averageRating;
    let ratingLabel = '';
    if (avg >= 4.5) ratingLabel = 'ممتاز';
    else if (avg >= 3.5) ratingLabel = 'جيد جداً';
    else if (avg >= 2.5) ratingLabel = 'جيد';
    else if (avg > 0) ratingLabel = 'ضعيف';
    else ratingLabel = 'لا يوجد تقييم بعد';

    res.status(200).json({
      pharmacy: {
        _id: pharmacy._id, name: pharmacy.name, address: pharmacy.address, phone: pharmacy.phone,
        openingHours: {
            formatted: `الصباح: من ${pharmacy.openingHours.morning.from} إلى ${pharmacy.openingHours.morning.to}, المساء: من ${pharmacy.openingHours.evening.from} إلى ${pharmacy.openingHours.evening.to}`,
            raw: pharmacy.openingHours,
        },
        workingDays: pharmacy.workingDays, imageUrl: pharmacy.imageUrl, description: pharmacy.description, location: pharmacy.location,
        services: pharmacy.services, socialMedia: pharmacy.socialMedia, website: pharmacy.website,
        reviews: pharmacy.reviews.map(review => ({ userId: review.userId, rating: review.rating })),
        reviewCount, averageRating: pharmacy.averageRating, ratingLabel,
        isActive: pharmacy.isActive, createdAt: pharmacy.createdAt, updatedAt: pharmacy.updatedAt,
      },
    });
  } catch (error) {
    console.error('خطأ بجلب بيانات الصيدلية:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الصيدلية' });
  }
};

exports.getMyPharmacyOrders = async (req, res) => {
  try {
    const orders = await pharmacyService.findOrdersByPharmacyUserId(req.user.id);
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    if(error.message.includes('لم يتم العثور')){
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات' });
  }
};

exports.ratePharmacy = async (req, res) => {
  try {
    const pharmacy = await pharmacyService.ratePharmacyById(req.params.id, req.user.id, req.body.rating);
    res.status(201).json({ message: 'Rating added successfully', averageRating: pharmacy.averageRating });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    if(statusCode === 500) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};

exports.checkUserHasPharmacy = async (req, res) => {
  try {
    const pharmacy = await pharmacyService.checkUserPharmacy(req.user._id);
    if (pharmacy) {
      res.status(200).json({ hasPharmacy: true, pharmacyId: pharmacy._id, pharmacyName: pharmacy.name });
    } else {
      res.status(200).json({ hasPharmacy: false });
    }
  } catch (error) {
    console.error('Error checking user pharmacy:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من صيدلية المستخدم' });
  }
};

exports.getPharmacyDetails = async (req, res) => {
  try {
    const pharmacy = await pharmacyService.findPharmacyDetailsById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    const publicDetails = {
      _id: pharmacy._id, name: pharmacy.name, imageUrl: pharmacy.imageUrl, address: pharmacy.address, phone: pharmacy.phone,
      openingHours: {
          formatted: `الصباح: من ${pharmacy.openingHours.morning.from} إلى ${pharmacy.openingHours.morning.to}, المساء: من ${pharmacy.openingHours.evening.from} إلى ${pharmacy.openingHours.evening.to}`,
          raw: pharmacy.openingHours,
      },
      workingDays: pharmacy.workingDays, description: pharmacy.description, services: pharmacy.services,
      socialMedia: pharmacy.socialMedia, website: pharmacy.website, averageRating: pharmacy.averageRating,
      isActive: pharmacy.isActive, location: pharmacy.location,
    };
    res.status(200).json(publicDetails);
  } catch (error) {
    console.log("error in getPharmacyDetails controller ", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addProductToPharmacy = async (req, res) => {
  try {
    const { productId, quantity, price } = req.body;
    const pharmacy = await pharmacyService.addProductToPharmacyStock(req.user.id, productId, quantity, price);
    res.status(200).json({ message: 'Product added successfully', pharmacy });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    if(statusCode === 500) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};

exports.findNearbyPharmacies = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    const nearbyPharmacies = await pharmacyService.findNearbyPharmacies(longitude, latitude, maxDistance);
    res.status(200).json(nearbyPharmacies);
  } catch (error) {
    if(error.message.includes('required')) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const result = await pharmacyService.createProductAndAddToPharmacy(req.user.id, req.body);
    res.status(201).json({
      message: 'Product created and added to pharmacy successfully',
      product: result.product,
      pharmacy: result.pharmacy,
    });
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
     if (statusCode === 500) {
        res.status(500).json({ error: 'Server error', details: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};

exports.getPharmacyMedicines = async (req, res) => {
  try {
    const pharmacy = await pharmacyService.findPharmacyMedicines(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.status(200).json({
      pharmacyId: pharmacy._id,
      medicines: pharmacy.medicines.map(med => ({
        medicineId: med.medicineId?._id, name: med.medicineId?.name, imageUrl: med.medicineId?.imageUrl,
        description: med.medicineId?.description, category: med.medicineId?.category,
        quantity: med.quantity, price: med.price,
      })),
    });
  } catch (error) {
    console.error('Error fetching pharmacy medicines:', error);
    res.status(500).json({ error: 'خطأ أثناء جلب الأدوية من الصيدلية' });
  }
};

exports.searchMedicineInPharmacy = async (req, res) => {
  try {
    const matchedMedicines = await pharmacyService.searchMedicineInPharmacyById(req.params.pharmacyId, req.query.name);
    res.status(200).json({ medicines: matchedMedicines });
  } catch (error) {
    console.error('خطأ أثناء البحث عن دواء في صيدلية:', error);
    const statusCode = error.message.includes('not found') ? 404 : error.message.includes('يرجى تحديد') ? 400 : 500;
    if(statusCode === 500) {
        res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
    } else {
        res.status(statusCode).json({ message: error.message });
    }
  }
};

exports.getPharmacyNamefromcart = async (req, res) => {
  try {
    const pharmacyNames = await pharmacyService.getPharmacyNamesFromCart(req.user.id);
    res.status(200).json({
      message: 'تم جلب أسماء الصيدليات بنجاح',
      pharmacies: pharmacyNames,
    });
  } catch (error) {
    console.error('خطأ في جلب أسماء الصيدليات:', error);
    if(error.message.includes('السلة فارغة')) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

exports.searchPharmacyByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Please provide a name to search' });
    }

    const pharmacies = await pharmacyService.findPharmacyByName(name);

    if (pharmacies.length === 0) {
      return res.status(404).json({
        message: 'No pharmacies found with this name',
        pharmacies: [],
      });
    }

    res.status(200).json({
      message: 'Pharmacies retrieved successfully',
      pharmacies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
