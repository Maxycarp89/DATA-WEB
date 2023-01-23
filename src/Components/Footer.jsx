import React from "react";
import {
  FaDribbbleSquare,
  FaFacebookSquare,
  FaGithubSquare,
  FaInstagram,
  FaTwitterSquare,
} from "react-icons/fa";

const Footer = () => {
  return (
    <div className="max-w-[1240px] mx-auto py-16 px-4 grid lg:grid-cols-3 gap-8 text-gray-300">
      <div>
        <h1 className="w-full text-3xl font-bold text-[#00df9a]">Title</h1>
        <p className="py-4">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cum mollitia
          optio odit iste, nostrum sapiente aperiam ea temporibus soluta
          excepturi fuga eius consequatur modi, magnam libero omnis porro alias
          corporis.
        </p>
        <div className=" flex justify-between md:w-[75%] my-6">
          <FaDribbbleSquare size={30}  className='hover:scale-125 duration-600'/>
          <FaFacebookSquare size={30}  className='hover:scale-125 duration-600'/>
          <FaGithubSquare size={30}  className='hover:scale-125 duration-600'/>
          <FaInstagram size={30}  className='hover:scale-125 duration-600'/>
          <FaTwitterSquare size={30} className='hover:scale-125 duration-600' />
        </div>
      </div>
      <div className="lg:col-span-2 flex justify-between mt-6">
        <div>
            <h6 className="font-medium text-gray-400">Solutions</h6>
          <ul>
            <li className="py-2 text-sm hover:scale-110 duration-600">Analitycs</li>
            <li className="py-2 text-sm hover:scale-110 duration-600">Marketing</li>
            <li className="py-2 text-sm hover:scale-110 duration-600">Commerce</li>
            <li className="py-2 text-sm hover:scale-110 duration-600">Insights</li>           
          </ul>
        </div>
        <div>
    <h6 className="font-medium text-gray-400">Support</h6>
  <ul>
    <li className="py-2 text-sm hover:scale-110 duration-600">Pricing</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Documentation</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Guides</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Api Status</li>           
  </ul>
</div>
<div>
    <h6 className="font-medium text-gray-400 ">Company</h6>
  <ul>
    <li className="py-2 text-sm hover:scale-110 duration-600">About</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Blog</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Jobs</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Careers</li>           
  </ul>
</div>
<div>
    <h6 className="font-medium text-gray-400 ">Legal</h6>
  <ul>
    <li className="py-2 text-sm hover:scale-110 duration-600">Claim</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Policy</li>
    <li className="py-2 text-sm hover:scale-110 duration-600">Terms</li>             
  </ul>
</div>
      </div>
    </div>
  );
};

export default Footer;
