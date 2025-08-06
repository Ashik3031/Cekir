import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    Title: "Mens/Shirt",
    displayTitle: "Men's Shirt",
    buttonText: "VIEW PRODUCTS",
    image:
      "https://img.freepik.com/free-photo/vertical-shot-successful-male-standing-with-hand-pocket_181624-44739.jpg?uid=P153408150&semt=ais_hybrid",
  },
  {
    Title: "Women/Top",
    displayTitle: "Ladies' Tops",
    buttonText: "VIEW PRODUCTS",
    image:
      "https://img.freepik.com/premium-photo/beautiful-woman-with-clean-skin-poses-street-city_333900-4297.jpg?uid=P153408150&semt=ais_hybrid",
  },
  {
    Title: "Mens/Suits",
    displayTitle: "Men's Suits",
    buttonText: "VIEW PRODUCTS",
    image:
      "https://img.freepik.com/free-photo/portrait-handsome-fashion-businessman-model-dressed-elegant-blue-suit-with-glasses-posing-gray_158538-11155.jpg?uid=P153408150&semt=ais_hybrid",
  },
  {
    Title: "Mens/Pants",
    displayTitle: "Men's Pants",
    buttonText: "VIEW PRODUCTS",
    image:
      "https://img.freepik.com/free-photo/man-wearing-brown-pants-close-up_53876-102239.jpg?uid=P153408150&semt=ais_hybrid",
  },
  {
    Title: "Kids/Sleepwear",
    displayTitle: "Kid's Sleepwear",
    buttonText: "VIEW PRODUCTS",
    image:
      "https://img.freepik.com/free-photo/child-pajama_146671-13730.jpg?uid=P153408150&semt=ais_hybrid",
  },
  {
    Title: "Kids/Shorts",
    displayTitle: "Kid's Shorts",
    buttonText: "VIEW PRODUCTS",
    image:
      "https://img.freepik.com/free-photo/front-view-smiling-cute-kid-riding-green-skateboard-white-t-shirt-orange-shorts-blue-space_179666-1170.jpg?uid=P153408150&semt=ais_hybrid",
  },
];

const CategoryCard = ({ title, buttonText, image, route }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/categories/${route}`);
  };

  return (
    <div
      className="relative group w-full md:w-[91%] h-[500px] overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-xl font-semibold mb-4">{title}</h3>
        <button className="px-6 py-2 bg-white text-black font-medium text-sm tracking-wide">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const CategoriesSection = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const [categoryTitle, subcategoryTitle] = category.Title.split("/");
          return (
            <CategoryCard
              key={index}
              title={category.displayTitle}
              buttonText={category.buttonText}
              image={category.image}
              route={`${categoryTitle}/${subcategoryTitle}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesSection;
