import  React from "react";
import bikes from "../assets/bikes.png";
import hogar from "../assets/hogar.png";
import interno from "../assets/yuhmak-interno.png";
import motos from "../assets/yuhmak-motos.jpg";

const Cards = () => {
  return (
    // <div className="w-full py-[10rem] px-4 bg-white">
    //   <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8">
    //     <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-500">
           
    //         <h2 className="text-2xl font-bold text-center py-8">logo</h2>
    //         <p className="text-center text-4xl font-bold">lorem ipsum</p>
    //         <div className="text-center font-medium">
          
    //         </div>
    //         <button className='bg-[#00df9a] w-[200px] rounded-md font-medium mx-auto my-6 px-6 py-3 text-black'>Start Trial</button>
    //     </div>
    //     <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-500">
           
    //         <h2 className="text-2xl font-bold text-center py-8">logo</h2>
    //         <p className="text-center text-4xl font-bold">lorem ipsum</p>
           
    //         <button className='text-[#00df9a] w-[200px] rounded-md font-medium mx-auto my-6 px-6 py-3 bg-black'>Start Trial</button>
    //     </div>
    //     <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-500">
            
    //         <h2 className="text-2xl font-bold text-center py-8">logo</h2>
    //         <p className="text-center text-4xl font-bold">lorem ipsum</p>
            
    //         <button className='bg-[#00df9a] w-[200px] rounded-md font-medium mx-auto my-6 px-6 py-3 text-black'>Start Trial</button>
    //     </div>
    //   </div>
    //   <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8">
    //     <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-500">
           
    //         <h2 className="text-2xl font-bold text-center py-8">logo</h2>
    //         <p className="text-center text-4xl font-bold">lorem ipsum</p>
    //         <div className="text-center font-medium">
          
    //         </div>
    //         <button className='bg-[#00df9a] w-[200px] rounded-md font-medium mx-auto my-6 px-6 py-3 text-black'>Start Trial</button>
    //     </div>
    //     <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-500">
           
    //         <h2 className="text-2xl font-bold text-center py-8">logo</h2>
    //         <p className="text-center text-4xl font-bold">lorem ipsum</p>
           
    //         <button className='text-[#00df9a] w-[200px] rounded-md font-medium mx-auto my-6 px-6 py-3 bg-black'>Start Trial</button>
    //     </div>
    //     <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-500">
            
    //         <h2 className="text-2xl font-bold text-center py-8">logo</h2>
    //         <p className="text-center text-4xl font-bold">lorem ipsum</p>
            
    //         <button className='bg-[#00df9a] w-[200px] rounded-md font-medium mx-auto my-6 px-6 py-3 text-black'>Start Trial</button>
    //     </div>
    //   </div>

    // </div>
<div className="px-4 py-8 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
  <label className="relative group">
    <input
      type="radio"
      name="radio1"
      className="absolute opacity-0 w-0 h-0 peer"
    />
    <img
      src={bikes}
      className="bg-gray-100 group-hover:drop-shadow-xl peer-checked:drop-shadow-xl cursor-pointer w-full object-cover p-10 pb-12 rounded-lg  transition-all"
    />
    <span className="group-hover:-translate-y-1 peer-checked:-translate-y-1 transition-all uppercase font-medium w-full text-center absolute bottom-2 tracking-widest text-gray-900 hover:cursor-pointer">
      BIKES
    </span>
  </label>
  <label className="relative group">
    <input
      type="radio"
      name="radio1"
      className="absolute opacity-0 w-0 h-0 peer"
    />
    <img
      src={hogar}
      className="bg-gray-100 group-hover:drop-shadow-xl peer-checked:drop-shadow-xl cursor-pointer w-full object-cover p-10 pb-12 rounded-lg  transition-all"
    />
    <span className="group-hover:-translate-y-1 peer-checked:-translate-y-1 transition-all uppercase font-medium w-full text-center absolute bottom-2 tracking-widest text-gray-900 hover:cursor-pointer">
      Hogar
    </span>
  </label>
  <label className="relative group">
    <input
      type="radio"
      name="radio1"
      className="absolute opacity-0 w-0 h-0 peer"
    />
    <img
      src={interno}
      className="bg-gray-100 group-hover:drop-shadow-xl peer-checked:drop-shadow-xl cursor-pointer w-full object-cover p-10 pb-12 rounded-lg  transition-all"
    />
    <span className="group-hover:-translate-y-1 peer-checked:-translate-y-1 transition-all uppercase font-medium w-full text-center absolute bottom-2 tracking-widest text-gray-900 hover:cursor-pointer">
      Repuestos
    </span>
  </label>
  
  <label className="relative group">
    <input
      type="radio"
      name="radio1"
      className="absolute opacity-0 w-0 h-0 peer"
    />
    <img
      src={motos}
      className="bg-gray-100 group-hover:drop-shadow-xl peer-checked:drop-shadow-xl cursor-pointer w-full object-cover p-10 pb-12 rounded-lg  transition-all"
    />
    <span className="group-hover:-translate-y-1 peer-checked:-translate-y-1 transition-all uppercase font-medium w-full text-center absolute bottom-2 tracking-widest text-gray-900 hover:cursor-pointer">
    Motos
    </span>
  </label>
</div>

  );
};

export default Cards;
