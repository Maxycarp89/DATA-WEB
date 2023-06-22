import  React from "react";
import bikes from "../assets/bikes.png";
import hogar from "../assets/hogar.png";
import interno from "../assets/yuhmak-interno.png";
import motos from "../assets/yuhmak-motos.jpg";

const Cards = () => {
  return (
    
 <div className=" min-h-screen flex items-center justify-center px-4 py-8 bg-white grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
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
