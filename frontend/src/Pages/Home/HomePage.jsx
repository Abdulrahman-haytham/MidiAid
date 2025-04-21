import React from 'react';
import SubTitle from '../../Component/Utility/SubTitle/SubTitle';
import Carousel from '../../Component/HomePage/Carousel/Carousel';
import Categories from '../../Component/Categories/Categories';
import Medicines from '../../Component/Medicines/Medicines';

// import { DotLottieReact } from 'lottie-react';
// import Loader from '../../Component/Loader/Loader'
// import Lottie from 'lottie-react';
const HomePage = () => {
  
  return (
    <div className='pb-5' style={{ minHeight: "100vh"}}>
      <Carousel />
      <SubTitle title="التصنيفات" />
      <Categories />
      <SubTitle title="جميع الأدوية" btnTitle={'More'} />
      <Medicines/>
      <SubTitle title="منتجات العناية بالبشرة" icon={'👌'} btnTitle={'More'}/>
      <Medicines/>

      <SubTitle title="مسكنات الألم" icon={'💊'} btnTitle={'More'}/>
      <Medicines/>

      <SubTitle title="أدوية مهمة لكل منزل " icon={'🏠'} btnTitle={'More'}/>
      <Medicines/>
     <div>
     {/* <Loader/>


    <Lottie
      src="https://lottie.host/8a65e446-0341-45b8-a8f9-0ee991f06ba5/4F5jhjhnA7.lottie"
      loop
      autoplay
    /> */}

     </div>
      {/* {medicinesData && <Medicines medicines={medicinesData} />} */}
    </div>
  );
};

export default HomePage;
