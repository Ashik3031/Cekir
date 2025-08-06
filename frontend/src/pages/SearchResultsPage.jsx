import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ProductCard } from "../features/products/components/ProductCard";
import { fetchSearchResults } from "../features/products/ProductApi";
import { Navbar } from "../features/navigation/components/Navbar";
import { Footer } from "../features/footer/Footer";
import { selectLoggedInUser } from "../features/auth/AuthSlice";
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, selectWishlistItems } from "../features/wishlist/WishlistSlice";

export const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const [searchResults, setSearchResults] = useState([]);
 
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const wishlistItems = useSelector(selectWishlistItems);

   const loggedInUser = useSelector(selectLoggedInUser);

  useEffect(() => {
    const getSearchResults = async () => {
      if (query?.trim()) {
        try {
          const results = await fetchSearchResults(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      }
    };

    getSearchResults();
  }, [query]);
  

    const handleAddRemoveFromWishlist = (e, productId) => {
      if (e.target.checked) {
        if (!loggedInUser) {
          navigate("/login");
        } else {
          const data = { user: loggedInUser._id, product: productId };
          dispatch(createWishlistItemAsync(data));
        }
      } else {
        const index = wishlistItems.findIndex(
          (item) => item.product._id === productId
        );
        if (index !== -1) {
          dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
      }
    };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-2xl  text-gray-900 mb-2 ">
            Search Results for "{query}"
          </h1>
          <p>
            {searchResults.length}{" "}
            {searchResults.length === 1 ? "item" : "items"} found
          </p>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                title={product.title}
                price={product.price}
                thumbnail={product.thumbnail}
                brand={product.brand}
                stockQuantity={product.stockQuantity}
                // Optional props for wishlist/admin use
                 handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                isWishlistCard={false}
                isAdminCard={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No Products Found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter to find what you are looking
              for
            </p>
            <div className="mt-6">
              <button
                onClick={() => Navigate("/")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};
