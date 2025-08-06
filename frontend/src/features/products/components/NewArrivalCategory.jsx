import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCategoriesAsync,
  selectCategories,
} from "../../categories/CategoriesSlice";

const NewArrivalCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectCategories);

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
  }, [dispatch]);

  const filteredCategories = categories.filter(
    (category) => category.name.toLowerCase() !== "brand"
  );

  return (
    <section className="px-4 md:px-20 py-12 bg-white text-center">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-serif tracking-wider uppercase mb-12">
        Explore the World of Al Marjaan
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {filteredCategories.map((category, index) => (
          <div
            key={index}
            className="cursor-pointer group"
            onClick={() => navigate(`/new-arrivals/${category.name}`)}
          >
            {/* Image */}
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={category.image || "/placeholder.jpg"}
                alt={category.name}
                className="w-full h-full object-cover group-hover:opacity-90 transition"
              />
            </div>

            {/* Label */}
            <p className="mt-4 text-sm md:text-base tracking-wider uppercase font-medium group-hover:underline">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivalCategory;
