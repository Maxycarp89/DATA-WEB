import React from "react";

const Home = () => {
  return (
    <div className="text-white">
      <div className="max-w-[800px] mt-[96px] w-full h-screen mx-auto text-center flex flex-col justify-center">
        <div className="flex justify-center items-center"></div>
          <h1 className="font-bold text-black text-[110px]">BIENVENIDO A <span className="text-[#22c55e]">YUHMAK</span></h1>
        <h2 className="font-bold text-black text-[110px]0">
          Por favor, ingresá tu DNI</h2>
        < input  type="search"  min="1" max="99999999" placeholder=" Ingresá tu DNI" className="bg-gray-200 rounded-md font-medium my-6 mx-auto py-3 text-black "/>
        
      </div>
    </div>
  );
};

export default Home;
