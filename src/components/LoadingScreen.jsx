import React from 'react';
// import logo from '/vite.svg'; // Add your logo path here

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* Your logo */}
      {/* <img src={logo} alt="Logo" className="h-12 mb-6" /> */}
      
      {/* Loading spinner */}
      <div className="w-10 h-10 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      
      <p className="mt-4 text-black text-sm tracking-wider">LOADING</p>
    </div>
  );
};

export default LoadingScreen;