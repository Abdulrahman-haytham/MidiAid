import React from 'react';
import Lottie from 'lottie-react';
const animationData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Simple Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [50, 50] },
          s: { a: 0, k: [50, 50] },
          nm: "Ellipse Path"
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

// console.log(animationData);
   

const Loader = () => {
  return (
    <div style={{ width: '400px',height:'400px', margin: ' auto' }}>
      <Lottie animationData={animationData} loop={true} />
    
    </div>
  );
};

export default Loader;
