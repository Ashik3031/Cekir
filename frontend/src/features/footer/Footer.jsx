import React from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaPinterestP,
} from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-[#f9f9f9] text-sm px-6 md:px-16 py-12 text-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
        {/* Practical Info */}
        <div>
          <h3 className="text-black font-semibold mb-4 uppercase text-[13px]">Practical Information</h3>
          <ul className="space-y-2">
            <li><a href="#">Track your order</a></li>
            <li><a href="#">Shipping & Delivery</a></li>
            <li><a href="#">Return an item</a></li>
            <li><a href="#">Help Center/FAQs</a></li>
            <li><a href="#">Privacy policy</a></li>
            <li><a href="#">Exclusive Offers</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-black font-semibold mb-4 uppercase text-[13px]">Services</h3>
          <ul className="space-y-2">
            <li><a href="#">Our Products</a></li>
            <li><a href="#">Find the ideal gift</a></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-black font-semibold mb-4 uppercase text-[13px]">Follow Us</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2"><FaFacebookF /> Facebook</li>
            <li className="flex items-center gap-2"><FaLinkedinIn /> Linkedin</li>
            <li className="flex items-center gap-2"><FaInstagram /> Instagram</li>
            <li className="flex items-center gap-2"><FaYoutube /> Youtube</li>
            <li className="flex items-center gap-2"><FaPinterestP /> Pinterest</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-black font-semibold mb-4 uppercase text-[13px]">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#">Website terms of use</a></li>
            <li><a href="#">Terms and Conditions for Online Product Sales</a></li>
            <li><a href="#">Online Privacy Policy</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">Brand Protection</a></li>
          </ul>
        </div>
      </div>

      {/* Explore Website & Country Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 border-t pt-4">
        <div className="mb-2 md:mb-0">
          <p className="uppercase font-semibold">Explore Website +</p>
        </div>
        <div>
          <p>Country / Language : <span className="text-black">International, English</span> ▸</p>
        </div>
      </div>
    </footer>
  );
};


