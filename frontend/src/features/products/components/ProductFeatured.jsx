import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { axiosi } from "../../../config/axios";
import { useNavigate } from "react-router-dom";

const ProductFeatured = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [selectedCategoryName, setSelectedCategoryName] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosi.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res =
          selectedCategoryId === "ALL"
            ? await axiosi.get("/products")
            : await axiosi.get(`/products?category=${selectedCategoryId}`);
        setProducts(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  const handleCategoryChange = (id, name) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
  };

  const handleViewDetails = (e, productId) => {
    e.stopPropagation();
    navigate(`product-details/${productId}`);
  };

  const displayedProducts = products.slice(0, 8);

  return (
    <section className="px-4 md:px-16 py-12 bg-gray-50">
      <h2 className="text-3xl font-serif text-center mb-10 tracking-wide text-gray-800">
        OUR PRODUCTS
      </h2>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-6 text-xs md:text-sm font-semibold uppercase tracking-wider mb-10">
        <button
          onClick={() => handleCategoryChange("ALL", "ALL")}
          className={`transition-colors duration-300 px-3 py-1 rounded-full ${
            selectedCategoryId === "ALL"
              ? "bg-black text-white shadow-lg"
              : "text-gray-700 hover:text-black"
          }`}
        >
          See All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategoryChange(cat._id, cat.name)}
            className={`transition-colors duration-300 px-3 py-1 rounded-full ${
              selectedCategoryId === cat._id
                ? "bg-black text-white shadow-lg"
                : "text-gray-700 hover:text-black"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <p className="text-center text-gray-400 text-lg">Loading products...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-lg">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
            {displayedProducts.map((product) => (
              <div
                key={product._id}
                className="cursor-pointer bg-white rounded-3xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col overflow-hidden"
                aria-label={`Product: ${product.title}`}
              >
                {/* Image */}
                <div className="relative w-full h-[360px] overflow-hidden rounded-t-3xl group">
                  {/* Primary Image */}
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.title}
                    className={`object-cover w-full h-full scale-100 group-hover:scale-110 transition-all duration-500 ease-in-out absolute inset-0 ${
                      product.images?.[1] ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'
                    }`}
                    loading="lazy"
                  />
                  
                  {/* Secondary Image - Shows on hover if available */}
                  {product.images?.[1] && (
                    <img
                      src={product.images[1]}
                      alt={`${product.title} - Alternative view`}
                      className="object-cover w-full h-full scale-100 group-hover:scale-110 transition-all duration-500 ease-in-out absolute inset-0 opacity-0 group-hover:opacity-100"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Label */}
                  {product.label && (
                    <span className="absolute top-4 left-4 bg-blue-700 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full shadow-lg z-10">
                      {product.label}
                    </span>
                  )}
                  {/* Price */}
                  <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 font-semibold text-lg text-gray-900 shadow-md z-10">
                    ₹{product.variants?.[0]?.price || product.price || "N/A"}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-5">
                  {/* Product Name */}
                  <h3 className="text-xl font-bold mb-2 text-gray-900 text-center">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 flex-grow mb-4 line-clamp-3 text-center">
                    {product.description}
                  </p>
                  
                 
                  
                  {/* View Details Button */}
                  <button
                    onClick={(e) => handleViewDetails(e, product._id)}
                    className="bg-black text-white py-3 rounded-full font-bold text-xs tracking-widest hover:bg-gray-900 active:scale-95 transform transition duration-150"
                    aria-label={`View details for ${product.title}`}
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          {products.length > 8 && (
            <div className="text-center mt-12">
              <button
                onClick={() =>
                  selectedCategoryName === "ALL"
                    ? navigate("/categories/all")
                    : navigate(`/categories/${selectedCategoryName}`)
                }
                className="underline uppercase text-sm tracking-widest text-gray-800 hover:text-gray-600 transition-colors duration-300"
              >
                View All
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ProductFeatured;