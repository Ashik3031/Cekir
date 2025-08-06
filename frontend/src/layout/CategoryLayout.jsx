// import { useEffect, useState } from "react";
// import { useParams, useLocation } from "react-router-dom";
// import { ProductCard } from "../features/products/components/ProductCard";
// import FilterPanel from "../features/products/components/FilterPanel";
// import { axiosi } from "../config/axios";

// const CategoryLayout = () => {
//   // IMPORTANT: Match the parameter names exactly as defined in your routes
//   const { categoryTitle, subcategoryTitle } = useParams();
//   const [products, setProducts] = useState([]);
//   const [filters, setFilters] = useState({});
//   const location = useLocation();

//   // Debug information
//   console.log("Current URL:", location.pathname);
//   console.log("Route Parameters:", { categoryTitle, subcategoryTitle });

//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         // Use the correct parameter name here too
//         const response = await axiosi.get(
//           `/products/latest-products/${categoryTitle}`,
//           {
//             params: {
//               ...filters,
//               // If subcategory exists, add it to the request
//               ...(subcategoryTitle && { subcategory: subcategoryTitle })
//             },
//           }
//         );
//         setProducts(response.data);
//       } catch (error) {
//         console.error("Error fetching Products", error);
//       }
//     };
//     loadProducts();
//   }, [categoryTitle, subcategoryTitle, filters]);

//   console.log("Products loaded:", products.length);

//   return (
//     <div className="flex container mx-auto px-6 md:px-12">
//       {/* Display current view for debugging */}
//       <div className="fixed top-20 right-4 bg-yellow-100 p-2 text-xs z-50">
//         <div>URL: {location.pathname}</div>
//         <div>Category: {categoryTitle}</div>
//         <div>Subcategory: {subcategoryTitle || "none"}</div>
//       </div>

//       {/* filter component  */}
//       <FilterPanel filters={filters} setFilters={setFilters} />

//       {/* products */}
//       <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
//         <h1 className="col-span-full text-2xl font-bold mb-4">
//           {subcategoryTitle ? `${subcategoryTitle} in ${categoryTitle}` : categoryTitle}
//         </h1>
        
//         {products.length > 0 ? (
//           products.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))
//         ) : (
//           <p className="col-span-full">
//             No products found for {subcategoryTitle ? `${subcategoryTitle} in ${categoryTitle}` : categoryTitle}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CategoryLayout;