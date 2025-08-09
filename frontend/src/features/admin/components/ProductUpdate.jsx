import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  fetchProductByIdAsync,
  updateProductByIdAsync,
  selectSelectedProduct,
  selectProductUpdateStatus,
} from "../../../features/products/ProductSlice";
import {
  selectVariants,
  setVariants,
} from "../../../features/products/VariantSlice";
import { useParams } from "react-router-dom";

// stable key for variant combos
const makeKey = (c, s) => `${c ?? ""}__${s ?? ""}`;

export const ProductUpdate = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector(selectSelectedProduct);
  const variants = useSelector(selectVariants);
  const updateStatus = useSelector(selectProductUpdateStatus);

  const [defaultImages, setDefaultImages] = useState([]);
  const [variantList, setVariantList] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);

  // New state for variant creation
  const [colors, setColors] = useState([]); // [{id,name,images:[],localImages:[]}]
  const [sizes, setSizes] = useState([]);   // [{id,name}]
  const [hasVariants, setHasVariants] = useState(false);
  const [showVariantCreator, setShowVariantCreator] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

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

  useEffect(() => {
    dispatch(fetchProductByIdAsync(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        brand: product.brand,
        price: product.price,
        compareAtPrice: product.compareAtPrice || "",
        stock: product.stock,
        category: product.category?._id || product.category,
        subCategory: product.subCategory?._id || product.subCategory,
        description: product.description,
        tags: product.tags?.join(", "),
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        seoTitle: product.seo?.title,
        seoDescription: product.seo?.description,
      });
      setDefaultImages(product.images || []);
      setHasVariants(product.hasVariants || false);
    }

    if (variants) {
      setVariantList(variants);
    }
  }, [product, variants, reset]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = await uploadToServer(files);
    setDefaultImages((prev) => [...prev, ...urls]);
  };

  const handleImageRemove = (index) => {
    const updated = [...defaultImages];
    updated.splice(index, 1);
    setDefaultImages(updated);
  };

  const handleVariantImageUpload = (variantIndex, e) => {
    const files = Array.from(e.target.files);
    const uploadImagesAndSet = async () => {
      const urls = await uploadToServer(files);
      setVariantList(prev => {
        return prev.map((variant, index) => {
          if (index !== variantIndex) return variant;

          return {
            ...variant,
            images: [...(variant.images || []), ...urls]
          };
        });
      });
    };
    uploadImagesAndSet();
  };

  const handleVariantImageRemove = (variantIndex, imageIndex) => {
    setVariantList(prev => {
      return prev.map((variant, index) => {
        if (index !== variantIndex) return variant;

        const newImages = [...(variant.images || [])];
        newImages.splice(imageIndex, 1);

        return {
          ...variant,
          images: newImages
        };
      });
    });
  };

  const handleVariantEdit = (variantIndex, field, value) => {
    setVariantList(prev => {
      const updated = prev.map((variant, index) => {
        if (index !== variantIndex) return variant;

        const updatedVariant = {
          ...variant,
          optionValues: variant.optionValues ? { ...variant.optionValues } : {}
        };

        if (field === "color") {
          updatedVariant.optionValues.Color = value;
        } else if (field === "size") {
          updatedVariant.optionValues.Size = value;
        } else if (field === "price") {
          updatedVariant.price = value === "" ? "" : parseFloat(value) || 0;
        } else if (field === "stock") {
          updatedVariant.stock = value === "" ? "" : parseInt(value) || 0;
        } else if (field === "compareAtPrice") {
          updatedVariant.compareAtPrice = value === "" ? null : parseFloat(value) || null;
        } else {
          updatedVariant[field] = value;
        }

        return updatedVariant;
      });

      return updated;
    });
  };

  const handleVariantRemove = (variantIndex) => {
    if (window.confirm("Are you sure you want to remove this variant?")) {
      setVariantList(prev => {
        const updated = prev.filter((_, index) => index !== variantIndex);

        if (editingVariant === variantIndex) {
          setEditingVariant(null);
        } else if (editingVariant > variantIndex) {
          setEditingVariant(editingVariant - 1);
        }

        return updated;
      });
    }
  };

  // Editing toggles
  const startEditingVariant = (variantIndex) => {
    setEditingVariant(variantIndex);
  };

  const stopEditingVariant = () => {
    setEditingVariant(null);
  };

  // Variant Creator helpers
  const addColor = () => {
    const colorName = prompt("Enter color name:");
    if (colorName && !colors.find(c => c.name.toLowerCase() === colorName.toLowerCase())) {
      setColors([...colors, {
        id: Date.now(),
        name: colorName.trim(),
        images: [],
        localImages: []
      }]);
    }
  };

  const removeColor = (colorId) => {
    if (window.confirm("Remove this color?")) {
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
      setSizes([...sizes, { id: Date.now(), name: sizeName.trim() }]);
    }
  };

  const removeSize = (sizeId) => {
    setSizes(sizes.filter(s => s.id !== sizeId));
  };

  // Create new variants based on colors and sizes
  const createVariantsFromColorsSizes = async () => {
    if (colors.length === 0 && sizes.length === 0) {
      alert("Please add at least one color or size first.");
      return;
    }

    try {
      // Upload color images first
      const updatedColors = await Promise.all(
        colors.map(async (color) => {
          if (color.localImages && color.localImages.length > 0) {
            const uploaded = await uploadToServer(color.localImages);
            return { ...color, images: uploaded };
          }
          return { ...color, images: [] };
        })
      );

      const colorNames = colors.length ? colors.map(c => c.name) : [null];
      const sizeNames = sizes.length ? sizes.map(s => s.name) : [null];

      const newVariants = [];
      colorNames.forEach(colorName => {
        sizeNames.forEach(sizeName => {
          const matchingColor = updatedColors.find(c => c.name === colorName);
          const optionValues = {};

          if (colorName) optionValues.Color = colorName;
          if (sizeName) optionValues.Size = sizeName;

          // NOTE: No temporary _id here
          newVariants.push({
            price: product?.price || 0,
            compareAtPrice: product?.compareAtPrice || null,
            stock: product?.stock || 0,
            images: matchingColor?.images || [],
            optionValues,
            isNew: true // flag to identify newly created variants in UI
          });
        });
      });

      // Add new variants to the existing list
      setVariantList(prevVariants => [...prevVariants, ...newVariants]);

      // Reset the creator
      setColors([]);
      setSizes([]);
      setShowVariantCreator(false);

      alert(`Successfully created ${newVariants.length} new variant(s)!`);
    } catch (error) {
      console.error("Error creating variants:", error);
      alert("Error uploading images. Please try again.");
    }
  };

  const colorNamesMemo = useMemo(() => colors.map(c => c.name), [colors]);
  const sizeNamesMemo = useMemo(() => sizes.map(s => s.name), [sizes]);

  const onSubmit = (data) => {
    const updatedData = new FormData();
    updatedData.append("_id", product._id);
    updatedData.append("name", data.name);
    updatedData.append("brand", data.brand);
    updatedData.append("price", data.price);
    updatedData.append("compareAtPrice", data.compareAtPrice || "");
    updatedData.append("stock", data.stock);
    updatedData.append("description", data.description);
    updatedData.append("category", data.category);
    updatedData.append("subCategory", data.subCategory);
    updatedData.append("isFeatured", data.isFeatured);
    updatedData.append("isActive", data.isActive);
    updatedData.append("tags", JSON.stringify(data.tags.split(",").map(t => t.trim()).filter(Boolean)));
    updatedData.append(
      "seo",
      JSON.stringify({
        title: data.seoTitle,
        description: data.seoDescription,
      })
    );
    updatedData.append("defaultImages", JSON.stringify(defaultImages));

    // CLEAN variants before send: remove fake ids & helper flags
    const cleanedVariants = variantList.map(v => {
      const copy = { ...v };
      // If no real DB id, ensure backend treats it as new
      if (!copy._id || (typeof copy._id === "string" && copy._id.startsWith("new_")) || copy.isNew) {
        delete copy._id;
      }
      delete copy.isNew;
      return copy;
    });
    updatedData.append("variants", JSON.stringify(cleanedVariants));

    // Ensure hasVariants is sent (string or boolean both ok; backend handles both)
    updatedData.append("hasVariants", hasVariants);

    dispatch(updateProductByIdAsync(updatedData));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Update Product</h1>
            <p className="text-sm text-gray-600 mt-1">Modify product details and variants</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    {...register("name")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare At Price (₹)
                    <span className="text-xs text-gray-500 block">Original/MRP price for discounts</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("compareAtPrice")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00 (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    {...register("stock")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
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
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {defaultImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Images ({defaultImages.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {defaultImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Product image ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(idx)}
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

            {/* Has Variants Toggle */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Variant Settings</h2>
              <div className="flex items-center space-x-4 mb-4">
                <label className="block text-sm font-medium text-gray-700">Do you want to edit variants?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasVariants(true)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      hasVariants
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasVariants(false)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      !hasVariants
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {hasVariants && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVariantCreator(!showVariantCreator)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    {showVariantCreator ? 'Hide' : 'Add New Variants'}
                  </button>
                </div>
              )}
            </div>

            {/* Variant Creator */}
            {hasVariants && showVariantCreator && (
              <div className="mb-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Variants</h3>

                  {/* Colors Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Colors</h4>
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Add Color
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colors.map((color) => (
                        <div key={color.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">{color.name}</h5>
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
                                className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
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
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
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
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Sizes</h4>
                      <button
                        type="button"
                        onClick={addSize}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
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

                  {/* Create Variants Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={createVariantsFromColorsSizes}
                      className="px-6 py-2 bg-green-800 text-black font-medium rounded-md hover:bg-purple-700"
                    >
                      Create Variants
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Product Variants */}
            {hasVariants && variantList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Product Variants ({variantList.length})
                  {variantList.some(v => v.isNew) && (
                    <span className="ml-2 text-sm text-green-600">
                      ({variantList.filter(v => v.isNew).length} new)
                    </span>
                  )}
                </h2>
                <div className="space-y-4">
                  {variantList.map((variant, vIdx) => (
                    <div key={vIdx} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">Variant {vIdx + 1}</h3>
                          {variant.isNew && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingVariant === vIdx ? (
                            <button
                              type="button"
                              onClick={stopEditingVariant}
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            >
                              Done Editing
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditingVariant(vIdx)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleVariantRemove(vIdx)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {editingVariant === vIdx ? (
                        // Edit Mode
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                              type="text"
                              value={variant.optionValues?.Color || ''}
                              onChange={(e) => handleVariantEdit(vIdx, 'color', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                            <input
                              type="text"
                              value={variant.optionValues?.Size || ''}
                              onChange={(e) => handleVariantEdit(vIdx, 'size', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price || ''}
                              onChange={(e) => handleVariantEdit(vIdx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Compare At Price (₹)
                              <span className="text-xs text-gray-400 block">MRP/Original</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.compareAtPrice || ''}
                              onChange={(e) => handleVariantEdit(vIdx, 'compareAtPrice', e.target.value ? parseFloat(e.target.value) : null)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                              type="number"
                              value={variant.stock || ''}
                              onChange={(e) => handleVariantEdit(vIdx, 'stock', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Color:</span>
                            <p className="text-gray-900">{variant.optionValues?.Color || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Size:</span>
                            <p className="text-gray-900">{variant.optionValues?.Size || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Price:</span>
                            <p className="text-gray-900">₹{variant.price}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Compare At Price:</span>
                            <p className="text-gray-900">
                              {variant.compareAtPrice ? `₹${variant.compareAtPrice}` : 'N/A'}
                              {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                                <span className="text-green-600 text-xs ml-1">
                                  ({Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100)}% off)
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Stock:</span>
                            <p className="text-gray-900">{variant.stock}</p>
                          </div>
                        </div>
                      )}

                      {/* Variant Images */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium text-gray-700">
                            Variant Images ({variant.images?.length || 0})
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleVariantImageUpload(vIdx, e)}
                            className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>

                        {variant.images && variant.images.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {variant.images.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={img}
                                  alt={`Variant ${vIdx + 1} image ${imgIdx + 1}`}
                                  className="w-full h-20 object-cover rounded-md border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariantImageRemove(vIdx, imgIdx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
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
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateStatus === "pending"}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateStatus === "pending" ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Product"
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

export default ProductUpdate;