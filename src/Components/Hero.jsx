import React from "react";

const Hero = () => {
  return (
    <div className="text-white">
      <div className="max-w-[800px] mt-[96px] w-full h-screen mx-auto text-center flex flex-col justify-center">
        <div className="flex justify-center items-center"></div>

        <button className="bg-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black hover:scale-150 duration-500">
          Soy cliente
        </button>
        <button className="bg-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black hover:scale-150 duration-500">
          No soy cliente
        </button>
      </div>
    </div>
  );
};

export default Hero;
