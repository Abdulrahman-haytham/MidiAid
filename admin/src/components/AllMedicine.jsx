import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../baseURL';

import styles from '../styles/Med.module.css';
const AllMedicine = () => {
  const token = localStorage.getItem('token');
  console.log(token);

  const [medicines, setMedicines] = useState([]);
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    type: 'Medicine',
    category: '',
    sub_category: '',
    brand: '',
    description: '',
    manufacturer: '',
    imageUrl: '',
    price: 0,
  });
  const [editMedicine, setEditMedicine] = useState(null);
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImage(file);
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await axios.post('https://midiaid.onrender.com/api/uploads/', formData,
         {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
      console.log(res);
      
      setImageUrl(res.data.data);
      console.log(url);
      
    } catch (error) {
      setErrorMessage('Failed to upload image.');
    }
  };
  // جلب قائمة الأدوية
  useEffect(() => {
    const fetchMedicines = async () => {
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      try {
        const response = await axios.get(`${baseURL}api/products/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMedicines(response.data);
        console.log("Fetched medicines:", response.data);
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    };

    fetchMedicines();
  }, [token]);


  // إضافة دواء جديد
  const handleAddMedicine = async () => {
    if (!newMedicine.name || !newMedicine.description) {
      console.error("Both name and description are required to add a new medicine.");
      return;
    }

    try {
      const response = await axios.post(`${baseURL}api/products/`, newMedicine, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Added new medicine:", response.data);
      setNewMedicine({
        name: '',
        type: 'Medicine',
        category: '',
        sub_category: '',
        brand: '',
        description: '',
        manufacturer: '',
        imageUrl: '',
        price: 0,
      }); // إعادة تعيين الحقول
      // تحديث القائمة بعد إضافة الدواء
      fetchMedicines();
    } catch (err) {
      console.error("Error adding medicine:", err);
    }
  };

  // تعديل دواء
  const handleEditMedicine = async (id) => {
    const medicineToEdit = medicines.find(med => med.id === id);
    setEditMedicine(medicineToEdit);
  };

  const handleSaveEdit = async () => {
    if (!editMedicine.name || !editMedicine.description) {
      console.error("Both name and description are required.");
      return;
    }

    try {
      const response = await axios.put(`${baseURL}api/products/${editMedicine._id}`, editMedicine, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Updated medicine:", response.data);
      setMedicines(medicines.map(med => (med.id === response.data.id ? response.data : med)));
      setEditMedicine(null);
    } catch (err) {
      console.error("Error updating medicine:", err);
    }
  };

  // حذف دواء
  const handleDeleteMedicine = async (id) => {
    try {
      await axios.delete(`${baseURL}api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Deleted medicine with id:", id);
      setMedicines(medicines.filter(med => med.id !== id));
    } catch (err) {
      console.error("Error deleting medicine:", err);
    }
  };

  // التعامل مع تغييرات حقول الإدخال
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicine((prevMedicine) => ({
      ...prevMedicine,
      [name]: value,
    }));
  };

  return (
    <div className="d-flex" style={{marginLeft: '50px' ,marginTop:'20px' }}>
      <div className="container-fluid p-4">
        <h3 className={`${styles.medText}`}>الأدوية</h3>
        <table className="table">
          <thead>
            <tr>
              <th scope="col" className={`${styles.medText}`}>#</th>
              <th scope="col" className={`${styles.medText}`}>الاسم</th>
              <th scope="col" className={`${styles.medText}`}>الوصف</th>
              <th scope="col" className={`${styles.medText}`}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {medicines && medicines.length > 0 ? (
              medicines.map((medicine, index) => (
                <tr key={medicine._id}>
                  <td className={`${styles.medText}`}>{index + 1}</td>
                  <td className={`${styles.medText}`}>{medicine.name}</td>
                  <td className={`${styles.medText}`}>{medicine.description}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditMedicine(medicine.id)}
                    >
                      تعديل
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteMedicine(medicine._id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={`${styles.medText}`}>لا توجد أدوية</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* نموذج إضافة دواء جديد */}
        <h4 className={`${styles.medText}`}>إضافة دواء جديد</h4>
        <div>
          <input
            type="text"
            name="name"
            placeholder="اسم الدواء"
            value={newMedicine.name}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
          <input
            type="text"
            name="description"
            placeholder="وصف الدواء"
            value={newMedicine.description}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
          <input
            type="text"
            name="type"
            placeholder="نوع الدواء"
            value={newMedicine.type}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
          <input
            type="text"
            name="category"
            placeholder="فئة الدواء"
            value={newMedicine.category}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
          <input
            type="text"
            name="sub_category"
            placeholder="الفئة الفرعية"
            value={newMedicine.sub_category}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
          <input
            type="text"
            name="brand"
            placeholder="علامة الدواء"
            value={newMedicine.brand}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
          <input
            type="text"
            name="manufacturer"
            placeholder="الشركة المصنعة"
            value={newMedicine.manufacturer}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <div>
        <input type="file" accept='image/*' 
               className={`user-input w-100 my-3 col-6 ${styles.Filde}`}
               onChange={handleImageUpload} required />
        </div>
        <div>
          <input
            type="number"
            name="p className={` ${styles.Filde}`}rice"
            placeholder="سعر الدواء"
            value={newMedicine.price}
            onChange={handleInputChange}
            className={` ${styles.Filde}`}
          />
        </div>
        <button  className={` btn btn-success ${styles.medBut}`} onClick={handleAddMedicine}>إضافة الدواء</button>

        {/* نموذج تعديل دواء */}
        {editMedicine && (
          <div>
            <h4 className={` ${styles.medText}`}>تعديل دواء</h4>
            <div>
              <input
                type="text"
                name="name"
                placeholder="اسم الدواء"
                value={editMedicine.name}
                onChange={(e) => setEditMedicine({ ...editMedicine, name: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <div>
              <input
                type="text"
                name="description"
                placeholder="وصف الدواء"
                value={editMedicine.description}
                onChange={(e) => setEditMedicine({ ...editMedicine, description: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <div>
              <input
                type="text"
                name="type"
                placeholder="نوع الدواء"
                value={editMedicine.type}
                onChange={(e) => setEditMedicine({ ...editMedicine, type: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <div>
              <input
                type="text"
                name="category"
                placeholder="فئة الدواء"
                value={editMedicine.category}
                onChange={(e) => setEditMedicine({ ...editMedicine, category: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <div>
              <input
                type="text"
                name="sub_category"
                placeholder="الفئة الفرعية"
                value={editMedicine.sub_category}
                onChange={(e) => setEditMedicine({ ...editMedicine, sub_category: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <div>
              <input
                type="text"
                name="brand"
                placeholder="علامة الدواء"
                value={editMedicine.brand}
                onChange={(e) => setEditMedicine({ ...editMedicine, brand: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <div>
              <input
                type="text"
                name="manufacturer"
                placeholder="الشركة المصنعة"
                value={editMedicine.manufacturer}
                onChange={(e) => setEditMedicine({ ...editMedicine, manufacturer: e.target.value })}
                className={` ${styles.Filde}`}
                
              />
            </div>
            <div>
            <input type="file" accept='image/*' 
              className="user-input w-100 my-3 col-6"
               onChange={handleImageUpload} required />
                className={` ${styles.Filde}`}
             
            </div>
            <div>
              <input
                type="number"
                name="price"
                placeholder="سعر الدواء"
                value={editMedicine.price}
                onChange={(e) => setEditMedicine({ ...editMedicine, price: e.target.value })}
                className={` ${styles.Filde}`}
              />
            </div>
            <button className={` btn ${styles.medBut}`} onClick={handleSaveEdit}>حفظ التعديلات</button>
            <button className="btn btn-secondary" onClick={() => setEditMedicine(null)}>إلغاء</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMedicine;

 
