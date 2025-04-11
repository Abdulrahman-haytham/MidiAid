import React from 'react';
import SubTitle from '../../Component/Utility/SubTitle/SubTitle';
import Carousel from '../../Component/HomePage/Carousel/Carousel';
import Categories from '../../Component/Categories/Categories';
import Medicines from '../../Component/Medicines/Medicines';

const HomePage = () => {
  
  return (
    <div style={{ minHeight: "100vh"}}>
      <Carousel />
      <SubTitle title="Categories" />
      <Categories />
      <SubTitle title="Medicines in Stock" btnTitle={'More'} />
      <Medicines/>
      <SubTitle title="Skin Care Medications" icon={'👌'} btnTitle={'More'}/>
      <Medicines/>

      <SubTitle title="Painkillers" icon={'💊'} btnTitle={'More'}/>
      <Medicines/>

      <SubTitle title="Hair Care Medications" icon={''} btnTitle={'More'}/>
      <Medicines/>

      <SubTitle title="Important Medicines For Every Home " icon={'🏠'} btnTitle={'More'}/>
      <Medicines/>


      {/* {medicinesData && <Medicines medicines={medicinesData} />} */}
    </div>
  );
};

export default HomePage;
