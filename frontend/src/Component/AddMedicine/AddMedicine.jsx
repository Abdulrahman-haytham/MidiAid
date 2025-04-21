import React, { useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
const AddMedicine = () => {
    const cookies= new  Cookies()
    const token = cookies.get('token')
    const [image, setImage] = useState('');

      const [imageUrl, setImageUrl] = useState('');
      const [newMedicine, setNewMedicine] = useState({
        name: '',
        type: '',
        category: '',
        sub_category: '',
        brand: '',
        description: '',
        manufacturer: '',
        imageUrl: '',
        price: 0,
      });
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
          console.log(imageUrl);
          
        } catch (error) {
          toast.error('Failed to upload image.');
        }
      };
       // إضافة دواء جديد
        const handleAddMedicine = async () => {
          if (!newMedicine.name || !newMedicine.description) {
            console.error("Both name and description are required to add a new medicine.");
            return;
          }
      
          try {
            const response = await axios.post(`https://midiaid.onrender.com/api/products/`, newMedicine, {
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
          
          } catch (err) {
            console.error("Error adding medicine:", err);
          }
        };
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMedicine((prevMedicine) => ({
          ...prevMedicine,
          [name]: value,
        }));
      };
  return (
    <div className='m-5 p-5'>
             <h4 className=''>إضافة دواء جديد</h4>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="اسم الدواء"
                    value={newMedicine.name}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="description"
                    placeholder="وصف الدواء"
                    value={newMedicine.description}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="type"
                    placeholder="نوع الدواء"
                    value={newMedicine.type}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="category"
                    placeholder="فئة الدواء"
                    value={newMedicine.category}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="sub_category"
                    placeholder="الفئة الفرعية"
                    value={newMedicine.sub_category}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="brand"
                    placeholder="علامة الدواء"
                    value={newMedicine.brand}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="manufacturer"
                    placeholder="الشركة المصنعة"
                    value={newMedicine.manufacturer}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <div>
                <input type="file" accept='image/*' 
                       className={`user-input w-100 my-3 col-6 `}
                       onChange={handleImageUpload} required />
                </div>
                <div>
                  <input
                    type="number"
                    name="p className={` ${styles.Filde}`}rice"
                    placeholder="سعر الدواء"
                    value={newMedicine.price}
                    onChange={handleInputChange}
                    className=''
                  />
                </div>
                <button  className={` btn btn-success`} onClick={handleAddMedicine}>إضافة الدواء</button>
        
    </div>
  )
}

export default AddMedicine