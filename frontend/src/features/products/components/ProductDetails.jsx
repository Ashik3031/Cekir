import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProductByIdAsync,
  clearSelectedProduct,
  selectSelectedProduct,

} from "../ProductSlice";
import {
  selectVariants,
  setSelectedVariant,
  clearVariants,
} from "../../products/VariantSlice";
import { addToCartAsync, selectCartItems } from "../../cart/CartSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { toast } from "react-toastify";
import {
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import FeaturedProductGrid from "./FeaturedProductGrid";

export const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  

  const product = useSelector(selectSelectedProduct);
  const variants = useSelector(selectVariants);
  const selectedVariant = useSelector((state) => state.variants.selectedVariant);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);

  const uniqueColors = [
    ...new Map(variants.map((v) => [v.optionValues.Color, v.images?.[0]])).entries(),
  ];
  const uniqueSizes = [...new Set(variants.map((v) => v.optionValues.Size).filter(Boolean))];

  useEffect(() => {
    if (!variants.length) return;
    const variant = variants.find((v) =>
      (!selectedOptions.Color || v.optionValues.Color === selectedOptions.Color) &&
      (!selectedOptions.Size || v.optionValues.Size === selectedOptions.Size)
    );
    if (variant) {
      dispatch(setSelectedVariant(variant));
      setSelectedImageIndex(0);
    } else {
      dispatch(setSelectedVariant(null));
    }
  }, [selectedOptions, variants, dispatch]);

  useEffect(() => {
    dispatch(fetchProductByIdAsync(id));
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(clearVariants());
    };
  }, [id, dispatch]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const imagesToShow =
    selectedVariant?.images?.length > 0 ? selectedVariant.images : product.images || [];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isInStock = currentStock > 0;

  const isInCart =
    !!selectedVariant &&
    cartItems.some((item) => item?.variant?._id === selectedVariant._id);

  const handleAddToCart = () => {
    if (!loggedInUser) return navigate("/login");
    if (!isInStock) return toast.error("Out of Stock");
    if (!selectedOptions?.Color) return toast.error("Please select a color");
    if (uniqueSizes.length > 0 && !selectedOptions?.Size)
      return toast.error("Please select a size");
    if (!selectedVariant || !selectedVariant._id) return toast.error("Variant not found");

    dispatch(
      addToCartAsync({
        user: loggedInUser._id,
        variant: selectedVariant._id,
        quantity,
      })
    );
    toast.success("Product added to cart");
  };

  const totalInventory = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Viewer */}
          <div className="lg:col-span-7">
            <div className="flex gap-6">
              <div className="flex flex-col gap-3 w-16">
                {imagesToShow.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      idx === selectedImageIndex
                        ? "border-black shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex-1 relative bg-gray-50 rounded-2xl overflow-hidden">
                {imagesToShow.length > 0 ? (
                  <>
                    <img
                      src={imagesToShow[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-[600px] object-cover"
                    />
                    {imagesToShow.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              (prev) => (prev - 1 + imagesToShow.length) % imagesToShow.length
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center"
                        >
                          <ArrowBackIos className="text-gray-700 ml-1" fontSize="small" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev + 1) % imagesToShow.length)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center"
                        >
                          <ArrowForwardIos className="text-gray-700" fontSize="small" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {imagesToShow.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-[600px] flex items-center justify-center text-gray-500">
                    <p>No Image Available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 lg:pl-8">
            <div className="sticky top-8">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-500 mb-2">Brand: {product.brand}</p>
              <p className="text-gray-500 mb-4">
                Category: {product.category?.name} / {product.subcategory?.name}
              </p>

              <div className="mb-4">
                <span className="text-2xl font-semibold text-gray-900">
                  AED {currentPrice}
                </span>
              </div>

              {/* User Only Options */}
              {!loggedInUser?.isAdmin && (
                <>
                  {/* Colors */}
                  {uniqueColors.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-2 font-medium">Select Color:</p>
                      <div className="flex space-x-3">
                        {uniqueColors.map(([color, img]) => (
                          <div
                            key={color}
                            onClick={() =>
                              setSelectedOptions((opts) => ({
                                ...opts,
                                Color: opts.Color === color ? undefined : color,
                              }))
                            }
                            className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer border-2 ${
                              selectedOptions.Color === color
                                ? "border-black scale-105 shadow-md"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <img src={img} alt={color} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {uniqueSizes.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-2 font-medium">Select Size:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {uniqueSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              setSelectedOptions((opts) => ({
                                ...opts,
                                Size: opts.Size === size ? undefined : size,
                              }))
                            }
                            className={`py-2 px-4 border rounded-lg text-sm font-medium ${
                              selectedOptions.Size === size
                                ? "bg-black text-white border-black"
                                : "border-gray-300 text-gray-700 hover:border-gray-500"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={
                      !selectedOptions.Color ||
                      (uniqueSizes.length > 0 && !selectedOptions.Size) ||
                      !isInStock ||
                      isInCart
                    }
                    className={`w-full py-4 rounded-full text-lg font-semibold transition-all ${
                      !selectedOptions.Color ||
                      (uniqueSizes.length > 0 && !selectedOptions.Size) ||
                      !isInStock ||
                      isInCart
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {isInCart ? "Already in Cart" : !isInStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                </>
              )}

              <div className="mt-10">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "No description available."}
                </p>
              </div>

              {loggedInUser?.isAdmin && (
                <div className="mt-12 border-t pt-6">
                  <h2 className="text-xl font-bold mb-4">Admin View</h2>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Slug:</strong> {product.slug}</p>
                    <p><strong>Category:</strong> {product.category?.name}</p>
                    <p><strong>Subcategory:</strong> {product.subcategory?.name}</p>
                    <p><strong>Tags:</strong> {product.tags?.join(", ")}</p>
                    <p><strong>Status:</strong> {product.isActive ? "Active" : "Inactive"} | {product.isFeatured ? "Featured" : "Not Featured"}</p>
                    <p><strong>SEO Title:</strong> {product.seo?.title}</p>
                    <p><strong>SEO Description:</strong> {product.seo?.description}</p>
                    <p><strong>Total Inventory:</strong> {totalInventory}</p>
                  </div>
                </div>
              )}
              {loggedInUser?.isAdmin && variants.length > 0 && (
  <div className="mt-8 border-t pt-6">
    <h2 className="text-lg font-semibold mb-4">Variant Details</h2>
    <div className="overflow-x-auto">
      <table className="w-full table-auto border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">#</th>
            <th className="border px-4 py-2 text-left">Color</th>
            <th className="border px-4 py-2 text-left">Size</th>
            <th className="border px-4 py-2 text-left">Price</th>
            <th className="border px-4 py-2 text-left">Stock</th>
            <th className="border px-4 py-2 text-left">SKU</th>
            <th className="border px-4 py-2 text-left">Slug</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, index) => {
            const isLow = v.stock < 5;
            return (
              <tr key={v._id} className={isLow ? "bg-yellow-50" : ""}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{v.optionValues?.Color || "-"}</td>
                <td className="border px-4 py-2">{v.optionValues?.Size || "-"}</td>
                <td className="border px-4 py-2">AED {v.price?.toFixed(2)}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      v.stock === 0
                        ? "bg-red-100 text-red-700"
                        : isLow
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {v.stock} {v.stock === 0 ? "(Out of Stock)" : isLow ? "(Low)" : ""}
                  </span>
                </td>
                <td className="border px-4 py-2">{v.sku}</td>
                <td className="border px-4 py-2">{v.slug}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}

            </div>
          </div>
        </div>
      </div>
      <FeaturedProductGrid />
    </div>
  );
};
