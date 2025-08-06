import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { fetchProductSuggestions } from "../products/ProductApi";
import { selectLoggedInUser } from "../auth/AuthSlice";



export const SearchBar = ({ className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const loggedInUser = useSelector(selectLoggedInUser);

  //Debounced search for suggestions
  useEffect(() => {
    const debouncedFetch = debounce(async () => {
      if ((searchTerm || "").trim().length > 1) {
        try {
          const suggestedProducts = await fetchProductSuggestions(searchTerm);
          setSuggestions(suggestedProducts);
        } catch (err) {
          console.error("Suggestion fetch error:", err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
  
    debouncedFetch();
  
    return () => debouncedFetch.cancel();
  }, [searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (loggedInUser?.isAdmin) {
        // Admin path - go to dashboard with search term
        navigate('/admin/dashboard', { 
          state: { 
            searchQuery: searchTerm,
            fromSearch: true 
          } 
        });
      } else {
        // Regular user path - go to search results page
        navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      }
      setSuggestions([]);
    }
  };
  

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex  ">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2  border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent"
          placeholder="Search Products..."
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onFocus={() => setIsFocused(true)}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-r-lg hover:bg-gray-4Search00 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* search suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {suggestions.map((product) => (
            <div
              key={product._id}
              onMouseDown={() => {
                if (loggedInUser?.isAdmin) {
            // Admin path - go to dashboard with filtered product in state
            navigate('/admin/dashboard', { 
              state: { 
                // filteredProductId: product._id,
                productId: product._id,  // More descriptive name
                searchQuery: product.title, // Keep search term if needed
                fromSearch: true 
              } 
            });
          } else {
            // Regular user path - go directly to product details
            navigate(`/product-details/${product._id}`);
          }
          setSearchTerm(product.title || product.name);
          setSuggestions([]);
              }}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            >
              <p className="font-medium text-gray-800">{product.title}</p>
              {/* <p className="text-sm text-gray-500 truncate">
                {product.description}
              </p> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
