import React, { useEffect, useState } from 'react';
import { useGetFromFavQuery } from '../../redux/feature/api/Api';
import { Container, Table } from 'react-bootstrap';
import { MdDelete } from 'react-icons/md';
import defaultImg from '../../assets/pro12.png';
import './Favourite.css';

const Favourite = () => {
  const [medFav, setMedFav] = useState([]);
  const { data, isLoading, isError } = useGetFromFavQuery();

  useEffect(() => {
    if (data && data.favorites) {
      setMedFav(data.favorites);
    }
  }, [data]);

  const handleDelete = (id) => {
    // هنا يمكنك إضافة دالة الحذف الفعلية عبر API
    const updatedList = medFav.filter(item => item._id !== id);
    setMedFav(updatedList);
    // يمكنك أيضًا إرسال طلب حذف إلى الـ backend هنا إذا توفر
  };

  if (isLoading) {
    return <p className="text-center mt-5"  style={{ minHeight: '100vh' }}>...جار تحميل المفضلة </p>;
  }

  if (isError) {
    return <p className="text-center mt-5 text-danger"  style={{ minHeight: '100vh' }}>فشل في تحميل المفضلة .</p>;
  }

  return (
    <Container>
      <div className="pt-3" style={{ minHeight:'100vh'}}> 
        <h2 className="fav-text mb-4"> المفضلة </h2>

        <Table hover variant="light" className="table-fav fs-5 text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الدواء</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {medFav.length > 0 ? (
              medFav.map((item, index) => (
                <tr key={item._id || index}>
                  <td className="fav-content">
                    <img
                      src={item.image || defaultImg}
                      className="img-fav"
                      alt="product"
                    />
                  </td>
                  <td className="fav-content">{item.name || 'Unnamed'}</td>
                  <td
                    className="fav-content text-danger fs-3"
                    onClick={() => handleDelete(item._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <MdDelete />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  المفضلة فارغة 
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default Favourite;
