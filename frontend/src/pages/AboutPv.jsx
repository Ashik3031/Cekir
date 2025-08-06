import React from "react";

const AboutSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-stretch w-full min-h-[500px]">
      {/* Left - Image */}
     

      {/* Right - Text */}
      <div className="w-full md:w-1/2 bg-[#f9f9f9] flex items-center justify-center text-center px-6 md:px-20 py-12">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-gray-600 mb-4">
            About CEKIR
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-normal mb-6">
            CERAMIC EXPERTISE
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
  Cekir’s handcrafted prayer mats showcase the artistry of skilled weavers, combining timeless Islamic traditions with contemporary design to create pieces that inspire serenity and devotion in every prayer.
</p>

          <a
            href="/about-us"
            className="text-sm underline font-medium hover:text-black transition"
          >
            Find out more
          </a>
        </div>
      </div>
       <div className="w-full md:w-1/2">
        <img
          src="https://res.cloudinary.com/dxq0nrirt/image/upload/v1753703052/IMG_6134_vyuszz.jpg" // replace with your own Cloudinary image if needed
          alt="Ceramics Expertise"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default AboutSection;
