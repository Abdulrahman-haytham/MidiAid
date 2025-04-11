
import { useState, useEffect } from "react";
import { baseURL } from "../baseURL";
import axios from "axios";

import styles from '../styles/Phar.module.css';
const AllPharmacies=()=>{
    
      const token = localStorage.getItem('token');
      const [pharmacies, setPharmacies] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const response = await axios.get(`${baseURL}api/pharmacies/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            setPharmacies(response?.data);
            console.log(response?.data);
            
            console.log("Fetched users:", response?.data);
          } catch (err) {
            console.error("خطأ :", err);
          }
        };
    
        fetchUsers();
      }, [token]);
    return(
        <div className="container-fluid p-4">
        <table className="table">
          <thead>
            <tr>
              <th scope="col" className={`${styles.pharText}`}>#</th>
              <th scope="col"className={`${styles.pharText}`}>Full Name</th>
              <th scope="col"className={`${styles.pharText}`}>Phone</th>
              <th scope="col"className={`${styles.pharText}`}>Address</th>
              <th scope="col"className={`${styles.pharText}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.length > 0 ? 
              pharmacies.map((pharmacy, i) => (
                <tr key={pharmacy._id}>
                  <td className={`${styles.pharText}`}>{i + 1}</td>
                  <td className={`${styles.pharText}`}>{pharmacy.name}</td>
                  <td className={`${styles.pharText}`}>{pharmacy.phone}</td>
                  <td className={`${styles.pharText}`}>{pharmacy.address}</td>
                  <td>
                    {/* <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteMedicine(user._id)}
                    >
                      show
                    </button> */}
                  </td>
                </tr>
              )) 
              : <tr><td colSpan="5" className={`${styles.pharText}`}>No users found</td></tr>
            }
          </tbody>
        </table>
      </div>
    )
}
export default AllPharmacies


