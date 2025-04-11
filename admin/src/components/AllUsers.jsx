import { useState, useEffect } from "react";
import { baseURL } from "../baseURL";
import axios from "axios";
import styles from '../styles/Users.module.css';
const AllUsers = () => {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);  // لإظهار وإخفاء المودال
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    location: { coordinates: [0, 0] },  // إحداثيات الموقع
    type: 'user'
  });

  // دالة لحذف المستخدم
  const handleDeleteMedicine = async (id) => {
    try {
      await axios.delete(`${baseURL}api/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Deleted user with id:", id);
      setUsers(users.filter(user => user._id !== id)); // تحديث قائمة المستخدمين
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // دالة لجلب المستخدمين
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseURL}api/auth/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response?.data);
        console.log("Fetched users:", response?.data);
      } catch (err) {
        console.error("خطأ :", err);
      }
    };

    fetchUsers();
  }, [token]);

  // دالة لتحديث الحقول عند إدخال بيانات المستخدم الجديد
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "location.coordinates") {
      // إذا كان الحقل هو الإحداثيات
      const updatedCoordinates = [...newUser.location.coordinates];
      updatedCoordinates[e.target.dataset.index] = parseFloat(value);
      setNewUser((prevUser) => ({
        ...prevUser,
        location: { coordinates: updatedCoordinates },
      }));
    } else {
      setNewUser((prevUser) => ({
        ...prevUser,
        [name]: value,
      }));
    }

    // تحديث الـ username عندما يتغير firstName أو lastName
    if (name === "firstName" || name === "lastName") {
      setNewUser((prevUser) => ({
        ...prevUser,
        username: prevUser.firstName + ' ' + prevUser.lastName
      }));
    }
  };

  // دالة لإضافة مستخدم جديد
  const handleAddUser = async () => {
    try {
      const response = await axios.post(`${baseURL}api/auth/users`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Added new user:", response.data);
      setUsers([...users, response.data]); // إضافة المستخدم الجديد إلى القائمة
      setShowModal(false); // إغلاق المودال
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  return (
    <div style={{ marginLeft: '50px' ,marginTop:'20px' }} className={``}>
      {/* زر لإظهار المودال */}
      <button type="button" onClick={() => setShowModal(true)} className={`btn ${styles.usersBut} `} >
        Add User
      </button>

      {/* المودال */}
      {showModal && (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className={`modal-content ${styles.pop} `}>
              <div className={`modal-header ${styles.popDisplay} `}>
                {/* <h5  className={`modal-title ${styles.userPopTil} `} >Add New User</h5>
              {/*}  <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>* /} */}
              </div>
              <div className={`modal-body  `}>
                {/* حقول إدخال المستخدم */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="address"
                    value={newUser.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="location.coordinates[0]"
                    data-index="0"
                    value={newUser.location.coordinates[0]}
                    onChange={handleInputChange}
                    placeholder="Longitude"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="location.coordinates[1]"
                    data-index="1"
                    value={newUser.location.coordinates[1]}
                    onChange={handleInputChange}
                    placeholder="Latitude"
                    className={`form-control ${styles.Filde}`}
                  />
                </div>
                <div>
                  <select
                    name="type"
                    value={newUser.type}
                    onChange={handleInputChange}
                    className={`form-control ${styles.Filde}`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button type="button" className={`btn btn-primary ${styles.popBut}`} onClick={handleAddUser}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* جدول المستخدمين */}
      <div className="container-fluid p-4">
        <table className={` table `} >
          <thead>
            <tr>
              <th scope="col" className={`${styles.usreText}`}>#</th>
              <th scope="col" className={`${styles.usreText}`}>Full Name</th>
              <th scope="col" className={`${styles.usreText}`}>Email</th>
              <th scope="col" className={`${styles.usreText}`}>Type</th>
              <th scope="col"className={`${styles.usreText}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? 
              users.map((user, i) => (
                <tr key={user._id}>
                  <td className={`${styles.usreText}`}>{i + 1}</td>
                  <td className={`${styles.usreText}`}>{user.firstName + ' ' + user.lastName}</td>
                  <td className={`${styles.usreText}`}>{user.email}</td>
                  <td className={`${styles.usreText}`}>{user.type}</td>
                  <td>
                    <button
                      className="btn btn-danger" 
                      onClick={() => handleDeleteMedicine(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) 
              : <tr><td colSpan="5" className={`${styles.usreText}`}>No users found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUsers;
