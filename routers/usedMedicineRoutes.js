const express = require('express');
const router = express.Router();
const UsedMedicine = require('../Models/UsedMedication'); // UsedMedicine model
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner

/**
 * @desc    Add a medicine to the user's used medicines list
 * @route   POST /api/used-medicines/add
 * @access  Private
 */
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    const { productId, dosage, frequency, startDate, endDate, reminderTime } = req.body;
    const userId = req.user.id;

    // Find the user's UsedMedicine document
    let usedMedicine = await UsedMedicine.findOne({ userId });

    if (!usedMedicine) {
      // If no document exists, create a new one
      usedMedicine = new UsedMedicine({ userId, medicines: [] });
    }

    // Check if the medicine already exists in the user's list
    const existingMedicine = usedMedicine.medicines.find(
      (medicine) => medicine.productId.toString() === productId.toString()
    );

    if (existingMedicine) {
      // Update the dosage, frequency, and other details if the medicine already exists
      existingMedicine.dosage = dosage;
      existingMedicine.frequency = frequency;
      existingMedicine.startDate = startDate || existingMedicine.startDate;
      existingMedicine.endDate = endDate || existingMedicine.endDate;
      existingMedicine.reminderTime = reminderTime || existingMedicine.reminderTime;
      existingMedicine.history.push({ changes: 'Updated dosage/frequency' });

      await usedMedicine.save();
      return res.status(200).json({ message: 'Medicine updated successfully', medicine: existingMedicine });
    }

    // If the medicine doesn't exist, create a new entry within the medicines array
    usedMedicine.medicines.push({ productId, dosage, frequency, startDate, endDate, reminderTime });
    await usedMedicine.save();

    res.status(201).json({ message: 'Medicine added successfully', medicine: usedMedicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Get all medicines in the user's used medicines list
 * @route   GET /api/used-medicines
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Find all medicines for the authenticated user and populate product details
    const usedMedicine = await UsedMedicine.findOne({ userId: req.user.id }).populate('medicines.productId', 'name type brand');
    
    if (!usedMedicine) {
      return res.status(404).json({ error: 'No medicines found for this user' });
    }

    res.status(200).json(usedMedicine.medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Update a medicine in the user's used medicines list
 * @route   PUT /api/used-medicines/update/:id
 * @access  Private
 */
router.put('/update/:id', isAuthenticated, async (req, res) => {
  try {
    const { dosage, frequency, endDate, reminderTime } = req.body;
    const userId = req.user.id;

    // Find the user's UsedMedicine document
    const usedMedicine = await UsedMedicine.findOne({ userId });

    if (!usedMedicine) {
      return res.status(404).json({ error: 'No medicines found for this user' });
    }

    // Find the specific medicine to update
    const medicine = usedMedicine.medicines.id(req.params.id);

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Update the medicine details
    medicine.dosage = dosage || medicine.dosage;
    medicine.frequency = frequency || medicine.frequency;
    medicine.endDate = endDate || medicine.endDate;
    medicine.reminderTime = reminderTime || medicine.reminderTime;
    medicine.history.push({ changes: 'Updated medicine details' });

    await usedMedicine.save();
    res.status(200).json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Delete a medicine from the user's used medicines list
 * @route   DELETE /api/used-medicines/delete/:id
 * @access  Private
 */
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's UsedMedicine document
    const usedMedicine = await UsedMedicine.findOne({ userId });

    if (!usedMedicine) {
      return res.status(404).json({ error: 'No medicines found for this user' });
    }

    // Find the specific medicine to delete
    const medicine = usedMedicine.medicines.id(req.params.id);

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Remove the medicine from the array
    usedMedicine.medicines.pull(medicine._id);
    await usedMedicine.save();
    res.status(200).json({ message: 'Medicine removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
