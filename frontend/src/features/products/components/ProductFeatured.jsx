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

  // 🔹 Helper: Always return FIRST variant price
  const getFirstVariantPrice = (product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants[0].price;
    }
    return product.price || "N/A";
  };

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
        Prayer Rugs
      </h2>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-6 text-xs md:text-sm font-semibold uppercase tracking-wider mb-10">
        <button
          onClick={() => handleCategoryChange("ALL", "ALL")}
          className={`px-3 py-1 rounded-full transition-colors duration-300 ${selectedCategoryId === "ALL"
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
            className={`px-3 py-1 rounded-full transition-colors duration-300 ${selectedCategoryId === cat._id
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
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              >
                {/* Image */}
                <div className="relative w-full h-[360px] overflow-hidden rounded-t-3xl group">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${product.images?.[1]
                        ? "group-hover:opacity-0"
                        : "opacity-100"
                      }`}
                  />

                  {product.images?.[1] && (
                    <img
                      src={product.images[1]}
                      alt={`${product.name} alternate`}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500"
                    />
                  )}

                  {/* Price */}
                  <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-full px-4 py-2 font-semibold text-lg shadow-md">
                    AED {getFirstVariantPrice(product)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-5 text-center">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  <button
                    onClick={(e) => handleViewDetails(e, product._id)}
                    className="mt-auto bg-black text-white py-3 rounded-full text-xs tracking-widest font-bold hover:bg-gray-900 active:scale-95 transition"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All */}
          {products.length > 8 && (
            <div className="text-center mt-12">
              <button
                onClick={() =>
                  selectedCategoryName === "ALL"
                    ? navigate("/categories/all")
                    : navigate(`/categories/${selectedCategoryName}`)
                }
                className="underline uppercase text-sm tracking-widest"
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
