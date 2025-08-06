import React, { useState } from 'react';

const BrandsSection = () => {
  const [visibleCount, setVisibleCount] = useState(6); // Show first 8 brands initially

  // Static brand data - replace with your dynamic data later
  const brands = [
    {
      id: 1,
      name: "Jaquar",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5yQUgyIvFFpKiZkPZa7o_wIEcD3_zwDt_q0s6&s=0"
    },
    {
      id: 2,
      name: "Kohler",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcIA1ZgNyagetEasvXp0VqXAgiCtP4FAIm_B6H&s=0"
    },
    {
      id: 3,
      name: "Cera",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpiuLNjNWGdrYp7s1U5Wf9kS_9__6rAYucIGOc&s=0"
    },
    {
      id: 4,
      name: "TOTO",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTZiZtCeI9Y9Z3E7VsIA2FYS7700YVzxUezbUh&s=0"
    },
    {
      id: 5,
      name: "Tesla",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=TESLA"
    },
    {
      id: 6,
      name: "Parryware",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=NETFLIX"
    },
    {
      id: 7,
      name: "Nike",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=NIKE"
    },
    {
      id: 8,
      name: "Samsung",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=SAMSUNG"
    },
    {
      id: 9,
      name: "Sony",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=SONY"
    },
    {
      id: 10,
      name: "Meta",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=META"
    },
    {
      id: 11,
      name: "Adobe",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=ADOBE"
    },
    {
      id: 12,
      name: "Intel",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=INTEL"
    },
    {
      id: 13,
      name: "IBM",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=IBM"
    },
    {
      id: 14,
      name: "Oracle",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=ORACLE"
    },
    {
      id: 15,
      name: "Cisco",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=CISCO"
    },
    {
      id: 16,
      name: "HP",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=HP"
    },
    {
      id: 17,
      name: "Dell",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=DELL"
    },
    {
      id: 18,
      name: "Spotify",
      logo: "https://via.placeholder.com/120x80/000000/FFFFFF?text=SPOTIFY"
    }
  ];

  const showMore = () => {
    // Add 4 more brands on mobile (2 cols), 6 more on desktop (6 cols)
    const isMobile = window.innerWidth < 768;
    const increment = isMobile ? 4 : 6;
    setVisibleCount(prevCount => prevCount + increment);
  };

  const visibleBrands = brands.slice(0, visibleCount);
  const hasMoreBrands = visibleCount < brands.length;

  return (
    <div className="bg-white py-16 px-4">
      <h1 className='text-center text-3xl font-semibold mb-8 uppercase'>Our Brands</h1>
      <div className="">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {visibleBrands.map((brand) => (
            <div 
              key={brand.id} 
              className="group cursor-pointer"
            >
              <div className="bg-gray-100 border-2 border-gray-200 aspect-square flex flex-col items-center justify-center p-2 md:p-4 transition-all duration-300 group-hover:border-black group-hover:bg-gray-50">
                <div className="mb-1 md:mb-2">
                 <img 
  src={brand.logo} 
  alt={brand.name}
  className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
/>

                </div>
                <h3 className="text-xs font-medium text-black text-center leading-tight">
                  {brand.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
        
        {hasMoreBrands && (
          <div className="text-center mt-8">
            <button 
              onClick={showMore}
              className="px-6 py-3 border-2 border-black bg-white text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsSection;