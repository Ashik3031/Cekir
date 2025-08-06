import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductAsync,
  selectProductAddStatus,
  resetProductAddStatus,
} from "../../products/ProductSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

// Upload Helper to Backend
const uploadToServer = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await axios.post(
    `${process.env.REACT_APP_BASE_URL}/upload/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data.urls;
};

export const AddProduct = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectCategories) || [];
  const productAddStatus = useSelector(selectProductAddStatus);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [defaultImages, setDefaultImages] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [defaultStock, setDefaultStock] = useState(0);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const isLoading = productAddStatus === "pending";

  useEffect(() => {
    if (productAddStatus === "fullfilled") {
      toast.success("New product added");
      navigate("/admin/dashboard");
      reset();
    } else if (productAddStatus === "rejected") {
      toast.error("Error adding product, please try again later");
    }
  }, [productAddStatus, navigate, reset]);

  useEffect(() => {
    return () => {
      dispatch(resetProductAddStatus());
    };
  }, [dispatch]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    const category = categories.find((cat) => cat._id === categoryId);
    setSubCategories(category?.subCategory || []);
  };

  const addColor = () => {
    const colorName = prompt("Enter color name:");
    if (colorName && !colors.find(c => c.name.toLowerCase() === colorName.toLowerCase())) {
      setColors([...colors, {
        id: Date.now(),
        name: colorName,
        images: [],
        localImages: []
      }]);
    }
  };

  const removeColor = (colorId) => {
    if (window.confirm("Remove this color and all its variants?")) {
      setColors(colors.filter(c => c.id !== colorId));
    }
  };

  const handleColorImageUpload = (colorId, files) => {
    const updatedColors = colors.map(color => {
      if (color.id === colorId) {
        return { ...color, localImages: Array.from(files) };
      }
      return color;
    });
    setColors(updatedColors);
  };

  const removeColorImage = (colorId, imageIndex) => {
    const updatedColors = colors.map(color => {
      if (color.id === colorId) {
        const newLocalImages = [...color.localImages];
        newLocalImages.splice(imageIndex, 1);
        return { ...color, localImages: newLocalImages };
      }
      return color;
    });
    setColors(updatedColors);
  };

  const addSize = () => {
    const sizeName = prompt("Enter size name:");
    if (sizeName && !sizes.find(s => s.name.toLowerCase() === sizeName.toLowerCase())) {
      setSizes([...sizes, { id: Date.now(), name: sizeName }]);
    }
  };

  const removeSize = (sizeId) => {
    setSizes(sizes.filter(s => s.id !== sizeId));
  };

  useEffect(() => {
    if (!hasVariants) {
      setVariants([]);
      return;
    }

    const newVariants = [];

    if (colors.length > 0 && sizes.length === 0) {
      colors.forEach(color => {
        newVariants.push({
          id: `${color.id}`,
          color: color.name,
          size: null,
          price: defaultPrice,
          stock: defaultStock,
          sku: ''
        });
      });
    } else if (colors.length === 0 && sizes.length > 0) {
      sizes.forEach(size => {
        newVariants.push({
          id: `${size.id}`,
          color: null,
          size: size.name,
          price: defaultPrice,
          stock: defaultStock,
          sku: ''
        });
      });
    } else if (colors.length > 0 && sizes.length > 0) {
      colors.forEach(color => {
        sizes.forEach(size => {
          newVariants.push({
            id: `${color.id}-${size.id}`,
            color: color.name,
            size: size.name,
            price: defaultPrice,
            stock: defaultStock,
            sku: ''
          });
        });
      });
    }

    setVariants(newVariants);
  }, [colors, sizes, defaultPrice, defaultStock, hasVariants]);

  const handleVariantChange = (variantId, field, value) => {
    const updatedVariants = variants.map(variant => {
      if (variant.id === variantId) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    setVariants(updatedVariants);
  };

  const handleDefaultImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setDefaultImages([...defaultImages, ...files]);
  };

  const handleRemoveDefaultImage = (indexToRemove) => {
    setDefaultImages(defaultImages.filter((_, index) => index !== indexToRemove));
  };

  const handleAddProduct = async (data) => {
    try {
      toast.info("Uploading images...");

      const uploadedDefaultImages = defaultImages.length > 0
        ? await uploadToServer(defaultImages)
        : [];

      const updatedColors = await Promise.all(
        colors.map(async (color) => {
          if (color.localImages && color.localImages.length > 0) {
            const uploaded = await uploadToServer(color.localImages);
            return { ...color, images: uploaded };
          }
          return { ...color, images: [] };
        })
      );

      const formattedVariants = variants.map(v => {
  const matchingColor = updatedColors.find(c => c.name === v.color);
  return {
    price: v.price,
    stock: v.stock,
    images: matchingColor?.images || [],
    attributes: {
      Color: v.color || undefined,
      Size: v.size || undefined
    }
  };
});


      const payload = {
        name: data.name,
        description: data.description,
        brand: data.brand,
        category: data.category,
        subCategory: data.subCategory,
        tags: data.tags?.split(",") || [],
        defaultImages: uploadedDefaultImages,
        defaultPrice: parseFloat(defaultPrice),
        defaultStock: parseInt(defaultStock),
        hasVariants,
        colors: updatedColors,
        sizes,
        variants: formattedVariants
      };

      console.log("Final Payload:", payload);
      dispatch(addProductAsync(payload));
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-600 mt-1">Create a new product with variants and specifications</p>
          </div>

          <form onSubmit={handleSubmit(handleAddProduct)} className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    {...register("brand")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter brand name"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  {...register("tags")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter product description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category", { required: "Category is required" })}
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category
                  </label>
                  <select
                    {...register("subCategory")}
                    disabled={!selectedCategoryId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map((subCat) => (
                      <option key={subCat._id} value={subCat._id}>
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Default Price & Stock */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Default Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDefaultImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                {defaultImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Default Images ({defaultImages.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {defaultImages.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDefaultImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Variants Toggle */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className="mb-8">
  <label className="block text-sm font-medium text-gray-700 mb-2">Does this product have variants?</label>
  <div className="flex gap-4">
    <button
      type="button"
      onClick={() => setHasVariants(true)}
      className={`px-4 py-2 rounded-md text-sm font-medium border ${
        hasVariants
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
      }`}
    >
      Yes
    </button>
    <button
      type="button"
      onClick={() => setHasVariants(false)}
      className={`px-4 py-2 rounded-md text-sm font-medium border ${
        !hasVariants
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
      }`}
    >
      No
    </button>
  </div>
</div>
              </div>
            </div>

            {/* Variants Section */}
            {hasVariants && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h2>
                
                {/* Colors Section */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Colors</h3>
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add Color
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {colors.map((color) => (
                        <div key={color.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{color.name}</h4>
                            <button
                              type="button"
                              onClick={() => removeColor(color.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color Images
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleColorImageUpload(color.id, e.target.files)}
                                className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                            </div>
                            
                            {color.localImages && color.localImages.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {color.localImages.map((file, idx) => (
                                  <div key={idx} className="relative">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`${color.name} ${idx + 1}`}
                                      className="w-full h-16 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeColorImage(color.id, idx)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sizes Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Sizes</h3>
                      <button
                        type="button"
                        onClick={addSize}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Add Size
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <div key={size.id} className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2">
                          <span className="text-sm text-gray-700">{size.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSize(size.id)}
                            className="ml-2 text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants Table */}
                  {variants.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Variant Details ({variants.length} variants)</h3>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {colors.length > 0 && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Color
                                </th>
                              )}
                              {sizes.length > 0 && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Size
                                </th>
                              )}
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price (₹)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                              </th>
                             
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map((variant) => (
                              <tr key={variant.id} className="hover:bg-gray-50">
                                {colors.length > 0 && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {variant.color}
                                  </td>
                                )}
                                {sizes.length > 0 && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {variant.size}
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(variant.id, "price", e.target.value)}
                                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => handleVariantChange(variant.id, "stock", e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </td>
                               
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Link
                  to="/admin/dashboard"
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </span>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};