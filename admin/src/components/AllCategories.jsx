import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../baseURL';

import styles from '../styles/Cat.module.css';
const AllCategories = () => {
  const token = localStorage.getItem('token');
  console.log(token);

  const [categores, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: 'https://example.com/electronics.jpg'
  });
  const [editCategory, setEditCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // جلب جميع التصنيفات
  const fetchCategories = async () => {
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }
    try {
      const response = await axios.get(`${baseURL}api/categories/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response?.data.categories);  // Adjust to use correct response property
      console.log("Fetched categories:", response?.data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setErrorMessage('Failed to fetch categories.');
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [token,newCategory]);

  // إضافة تصنيف جديد
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      console.error("Name is required to add a new category.");
      return;
    }

    try {
      const response = await axios.post(`${baseURL}api/categories/create`, newCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Added new category:", response?.data);
      setNewCategory({ name: '', image: 'https://example.com/img.jpg' });  // إعادة تعيين الحقول
      // تحديث القائمة بعد إضافة التصنيف
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      setErrorMessage('Failed to add category.');
    }
  };

  // تعديل تصنيف
  const handleSaveEdit = async () => {
    if (!editCategory.name) {
      console.error("Name is required to update category.");
      return;
    }

    try {
      const response = await axios.put(`${baseURL}api/categories/update/${editCategory._id}`, editCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Updated category:", response?.data);
      setCategories(categores.map(cat => (cat._id === response.data._id ? response.data : cat)));
      setEditCategory(null);  // Reset edit form
    } catch (err) {
      console.error("Error updating category:", err);
      setErrorMessage('Failed to update category.');
    }
  };

  // حذف تصنيف حسب الاسم
  const handleDeleteCategoryByName = async (name) => {
    try {
      await axios.delete(`${baseURL}api/categories/delete-by-name/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Deleted category with name:", name);
      setCategories(categores?.filter(cat => cat.name !== name));
    } catch (err) {
      console.error("Error deleting category by name:", err);
      setErrorMessage('Failed to delete category.');
    }
  };

  // حذف تصنيف حسب الـ ID
  const handleDeleteCategoryById = async (id) => {
    try {
      await axios.delete(`${baseURL}api/categories/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Deleted category with id:", id);
      setCategories(categores.filter(cat => cat._id !== id));
    } catch (err) {
      console.error("Error deleting category by ID:", err);
      setErrorMessage('Failed to delete category.');
    }
  };

  // التعامل مع تغييرات حقول الإدخال
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prevCategory) => ({
      ...prevCategory,
      [name]: value,
    }));
  };

  // التعامل مع رفع الصورة
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await axios.post('https://midiaid.onrender.com/api/uploads/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(res);
      setNewCategory(prev => ({ ...prev, image: res.data?.imageUrl }));  // Set the image URL to the category
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrorMessage('Failed to upload image.');
    }
  };

  return (
    <div className="d-flex" style={{marginLeft: '50px' ,marginTop:'20px' }}>
      <div className="container-fluid p-4">
        <h3 className={`${styles.catText}`}>التصنيفات</h3>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <table className="table">
          <thead>
            <tr>
              <th scope="col" className={`${styles.catText}`}>#</th>
              <th scope="col" className={`${styles.catText}`}>الاسم</th>
              <th scope="col" className={`${styles.catText}`}>الصورة</th>
              <th scope="col" className={`${styles.catText}`}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categores && categores.length > 0 ? (
              categores.map((category, index) => (
                <tr key={category._id}>
                  <td>{index + 1}</td>
                  <td>{category.name}</td>
                  <td>{category.image}</td>
                  {/* <td><img src={category.image} alt={category.name} width="50" /></td> */}
                  <td>
                    <button
                      className={` btn ${styles.catBut}`}
                      onClick={() => setEditCategory(category)}
                    >
                      تعديل
                    </button>
                    <button
                      className={` btn ${styles.catBut}`}
                      onClick={() => handleDeleteCategoryById(category._id)}
                    >
                      حذف حسب ID
                    </button>
                    <button
                     className={` btn ${styles.catBut}`}
                      onClick={() => handleDeleteCategoryByName(category.name)}
                    >
                      حذف حسب الاسم
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={`${styles.catText}`}>لا توجد تصنيفات</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* نموذج إضافة تصنيف جديد */}
        <h4 className={`${styles.catText}`}>إضافة تصنيف جديد</h4>
        <div>
          <input
            type="text"
            name="name"
            placeholder="اسم التصنيف"
            value={newCategory.name}
            onChange={handleInputChange}
            className={`${styles.Filde}`}
          />
        </div>
        <div>
          {/* <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageUpload}
            className={`${styles.Filde}`}
          /> */}
        </div>
        <button className={` btn ${styles.catBut}`}onClick={handleAddCategory}>إضافة التصنيف</button>

        {/* نموذج تعديل تصنيف */}
        {editCategory && (
          <div>
            <h4  className={`${styles.catText}`}>تعديل تصنيف</h4>
            <div>
              <input
                type="text"
                name="name"
                placeholder="اسم التصنيف"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
              />
            </div>
            <button  className={` btn${styles.catBut}`} onClick={handleSaveEdit}>حفظ التعديلات</button>
            <button className="btn btn-secondary" onClick={() => setEditCategory(null)}>إلغاء</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategories;
