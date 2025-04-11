import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import styles from '../styles/Side.module.css';
function Sidebar() {
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className={`sidebar  text-white p-4 vh-100 ${styles.sidebar}`} >
                <div>
                    <Link to='d-flex align-items-center' className={` ${styles.underlineOff} `} >
                       {/**  <i className='bi bi-bootstrap fs-5 me-2'> </i> **/}
                        <span className={`fs-1 ${styles.sidebarText} ${styles.linkHover}`}>Sidebar</span>
                    </Link>
                    <hr className='text-secondary mt-2' />
                    <ul className={` nav nav-pills flex-column p-0 m-0 ${styles.sidebarText}`}>
                        <li className='nav-item p-1'>
                            <Link to="medicines" className={`nav-link text-white ${styles.linkTextHover}`}>
                                <i className='bi bi-capsule me-2 fs-5'></i>
                                <span className={`fs-5 ${styles.sidebarText} ${styles.linkTextHover} `}>Medicines</span>
                            </Link>
                        </li>
                        <li className='nav-item p-1'>
                            <Link to='users' className={`nav-link text-white ${styles.linkTextHover}`}>
                                <i className='bi bi-people me-2 fs-5'></i>
                                <span className={`fs-5 ${styles.sidebarText} ${styles.linkTextHover}`}>Users</span>
                            </Link>
                        </li>
                        <li className='nav-item p-1'>
                            <Link to="pharmacies" className={`nav-link text-white ${styles.linkTextHover}`}>
                                <i className='bi bi-house-add me-2 fs-5'></i>
                                <span className={`fs-5 ${styles.sidebarText} ${styles.linkTextHover}`}>Pharmacies</span>
                            </Link>
                        </li>
                       
                        <li className='nav-item p-1'>
                            <Link to="categories" className={`nav-link text-white ${styles.linkTextHover}`}>
                                <i className='bi bi-question-circle me-2 fs-5'></i>
                                <span className={`fs-5 ${styles.sidebarText} ${styles.linkTextHover}`}>Categories</span>
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className={` `}>
                    <hr className='text-secondary' />
                    <div className={`${styles.adminHover} `}>
                    <i className='bi bi-person fs-5'></i>
                    <span className={`fs-4 ${styles.admin}  `}>Admin</span>
               
                    </div>
                     </div>
            </div>
        </div>
    );
};

export default Sidebar;
