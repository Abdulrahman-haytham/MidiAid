const UsedMedicine = require('../models/UsedMedication'); // استيراد نموذج الأدوية المستعملة


exports.addMedicine = async (req, res) => {
  try {
    const { productId, dosage, frequency, startDate, endDate, reminderTime } = req.body;
    const userId = req.user.id;

    // Find the user's UsedMedicine document
    let usedMedicine = await UsedMedicine.findOne({ userId });

    if (!usedMedicine) {
      usedMedicine = new UsedMedicine({ userId, medicines: [] });
    }

    const existingMedicine = usedMedicine.medicines.find(
      (medicine) => medicine.productId.toString() === productId.toString()
    );

    if (existingMedicine) {
      existingMedicine.dosage = dosage;
      existingMedicine.frequency = frequency;
      existingMedicine.startDate = startDate || existingMedicine.startDate;
      existingMedicine.endDate = endDate || existingMedicine.endDate;
      existingMedicine.reminderTime = reminderTime || existingMedicine.reminderTime;
      existingMedicine.history.push({ changes: 'Updated dosage/frequency' });

      await usedMedicine.save();
      return res.status(200).json({ message: 'Medicine updated successfully', medicine: existingMedicine });
    }

    usedMedicine.medicines.push({ productId, dosage, frequency, startDate, endDate, reminderTime });
    await usedMedicine.save();

    res.status(201).json({ message: 'Medicine added successfully', medicine: usedMedicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMedicines = async (req, res) => {
  try {
    const usedMedicine = await UsedMedicine.findOne({ userId: req.user.id }).populate('medicines.productId', 'name type brand');
    
    if (!usedMedicine) {
      return res.status(404).json({ error: 'No medicines found for this user' });
    }

    res.status(200).json(usedMedicine.medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateMedicine = async (req, res) => {
    try {
      const { dosage, frequency, endDate, reminderTime } = req.body;
      const userId = req.user.id;
  
      // ابحث عن سجل UsedMedicine الخاص بالمستخدم
      const usedMedicine = await UsedMedicine.findOne({ userId });
  
      if (!usedMedicine) {
        return res.status(404).json({ error: 'No medicines found for this user' });
      }
  
      // ابحث عن الدواء باستخدام معرّف الدواء
      const medicine = usedMedicine.medicines.id(req.params.id);
  
      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
  
      // تحديث البيانات بناءً على القيم الجديدة
      medicine.dosage = dosage || medicine.dosage;
      medicine.frequency = frequency || medicine.frequency;
      medicine.endDate = endDate || medicine.endDate;
      medicine.reminderTime = reminderTime || medicine.reminderTime;
  
      // إضافة التغيير في التاريخ
      medicine.history.push({
        changes: 'Updated medicine details',
        date: new Date(),
      });
  
      // حفظ التغييرات
      await usedMedicine.save();
      res.status(200).json({ message: 'Medicine updated successfully', medicine });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  

exports.deleteMedicine = async (req, res) => {
  try {
    const userId = req.user.id;

    const usedMedicine = await UsedMedicine.findOne({ userId });

    if (!usedMedicine) {
      return res.status(404).json({ error: 'No medicines found for this user' });
    }

    const medicine = usedMedicine.medicines.id(req.params.id);

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    usedMedicine.medicines.pull(medicine._id);
    await usedMedicine.save();
    res.status(200).json({ message: 'Medicine removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
