import React from "react";

const Home = () => {
  return (
    <div className="text-white">
      <div className="max-w-[800px] mt-[96px] w-full h-screen mx-auto text-center flex flex-col justify-center">
        <div className="flex justify-center items-center"></div>
          <h1 className="font-bold text-black text-[110px]">BIENVENIDO A <span className="text-[#22c55e]">YUHMAK</span></h1>
        <button className="bg-[#22c55e] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black hover:scale-150 duration-500">
          Soy cliente
        </button>
        <button className="bg-[#22c55e] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black hover:scale-150 duration-500">
          No soy cliente
        </button>
      </div>
    </div>
  );
};

export default Home;
