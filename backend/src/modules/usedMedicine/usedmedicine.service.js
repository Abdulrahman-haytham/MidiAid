// src/modules/usedMedicine/usedmedicine.service.js

const UsedMedicine = require('./UsedMedication');

const usedMedicineService = {

  /**
   * إضافة دواء مستخدم جديد أو تحديث دواء موجود.
   * @param {string} userId - معرّف المستخدم.
   * @param {object} medicineData - بيانات الدواء.
   * @returns {Promise<{message: string, medicine: object}>} - رسالة و كائن الدواء/السجل.
   */
  async addOrUpdateUsedMedicine(userId, medicineData) {
    const { productId, dosage, frequency, startDate, endDate, reminderTime } = medicineData;
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
      return { message: 'Medicine updated successfully', medicine: existingMedicine };
    }

    usedMedicine.medicines.push({ productId, dosage, frequency, startDate, endDate, reminderTime });
    await usedMedicine.save();
    // إعلام: لم أغير المنطق هنا، حيث يُرجع كامل المستند وليس فقط الدواء المضاف.
    return { message: 'Medicine added successfully', medicine: usedMedicine };
  },

  /**
   * جلب قائمة الأدوية المستخدمة للمستخدم.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<Array|null>} - مصفوفة الأدوية أو null.
   */
  async findUserMedicines(userId) {
    return await UsedMedicine.findOne({ userId }).populate('medicines.productId', 'name type brand');
  },

  /**
   * تحديث تفاصيل دواء مستخدم معين.
   * @param {string} userId - معرّف المستخدم.
   * @param {string} medicineSubDocId - معرّف المستند الفرعي للدواء.
   * @param {object} updateData - البيانات الجديدة.
   * @returns {Promise<object>} - الدواء المحدث.
   */
  async updateUsedMedicineDetails(userId, medicineSubDocId, updateData) {
    const { dosage, frequency, endDate, reminderTime } = updateData;
    const usedMedicine = await UsedMedicine.findOne({ userId });

    if (!usedMedicine) {
      throw new Error('No medicines found for this user');
    }

    const medicine = usedMedicine.medicines.id(medicineSubDocId);
    if (!medicine) {
      throw new Error('Medicine not found');
    }

    medicine.dosage = dosage || medicine.dosage;
    medicine.frequency = frequency || medicine.frequency;
    medicine.endDate = endDate || medicine.endDate;
    medicine.reminderTime = reminderTime || medicine.reminderTime;

    medicine.history.push({
      changes: 'Updated medicine details',
      date: new Date(),
    });

    await usedMedicine.save();
    return medicine;
  },

  /**
   * حذف دواء مستخدم معين.
   * @param {string} userId - معرّف المستخدم.
   * @param {string} medicineSubDocId - معرّف المستند الفرعي للدواء.
   * @returns {Promise<void>}
   */
  async deleteUsedMedicine(userId, medicineSubDocId) {
    const usedMedicine = await UsedMedicine.findOne({ userId });
    if (!usedMedicine) {
      throw new Error('No medicines found for this user');
    }
    const medicine = usedMedicine.medicines.id(medicineSubDocId);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    usedMedicine.medicines.pull(medicine._id);
    await usedMedicine.save();
  }
};

module.exports = usedMedicineService;