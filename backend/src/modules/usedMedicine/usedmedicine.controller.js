// src/modules/usedMedicine/usedmedicine.controller.js

const usedMedicineService = require('./usedmedicine.service');

exports.addMedicine = async (req, res) => {
  try {
    const result = await usedMedicineService.addOrUpdateUsedMedicine(req.user.id, req.body);
    const statusCode = result.message.includes('updated') ? 200 : 201;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const usedMedicineDoc = await usedMedicineService.findUserMedicines(req.user.id);
    if (!usedMedicineDoc) {
      return res.status(404).json({ error: 'No medicines found for this user' });
    }
    res.status(200).json(usedMedicineDoc.medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await usedMedicineService.updateUsedMedicineDetails(req.user.id, req.params.id, req.body);
    res.status(200).json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    console.error(error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    if (statusCode === 500) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    await usedMedicineService.deleteUsedMedicine(req.user.id, req.params.id);
    res.status(200).json({ message: 'Medicine removed successfully' });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    if (statusCode === 500) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};