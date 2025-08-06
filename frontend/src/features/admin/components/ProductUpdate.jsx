import React, { useEffect, useState } from "react";
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

export const ProductUpdate = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector(selectSelectedProduct);
  const variants = useSelector(selectVariants);
  const updateStatus = useSelector(selectProductUpdateStatus);

  const [defaultImages, setDefaultImages] = useState([]);
  const [variantList, setVariantList] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);

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
      const updated = [...variantList];
      updated[variantIndex].images = [
        ...(updated[variantIndex].images || []),
        ...urls,
      ];
      setVariantList(updated);
    };
    uploadImagesAndSet();
  };

  const handleVariantImageRemove = (variantIndex, imageIndex) => {
    const updated = JSON.parse(JSON.stringify(variantList));
    updated[variantIndex].images.splice(imageIndex, 1);
    setVariantList(updated);
  };

  const handleVariantEdit = (variantIndex, field, value) => {
    const updated = [...variantList];
    if (field === "color") {
      updated[variantIndex].optionValues.Color = value;
    } else if (field === "size") {
      updated[variantIndex].optionValues.Size = value;
    } else {
      updated[variantIndex][field] = value;
    }
    setVariantList(updated);
  };

  const handleVariantRemove = (variantIndex) => {
    if (window.confirm("Are you sure you want to remove this variant?")) {
      const updated = [...variantList];
      updated.splice(variantIndex, 1);
      setVariantList(updated);
    }
  };

  const toggleVariantEdit = (variantIndex) => {
    setEditingVariant(editingVariant === variantIndex ? null : variantIndex);
  };

  const onSubmit = (data) => {
    const updatedData = new FormData();
    updatedData.append("_id", product._id);
    updatedData.append("name", data.name);
    updatedData.append("brand", data.brand);
    updatedData.append("price", data.price);
    updatedData.append("stock", data.stock);
    updatedData.append("description", data.description);
    updatedData.append("category", data.category);
    updatedData.append("subCategory", data.subCategory);
    updatedData.append("isFeatured", data.isFeatured);
    updatedData.append("isActive", data.isActive);
    updatedData.append("tags", JSON.stringify(data.tags.split(",")));
    updatedData.append(
      "seo",
      JSON.stringify({
        title: data.seoTitle,
        description: data.seoDescription,
      })
    );
    updatedData.append("defaultImages", JSON.stringify(defaultImages));
    updatedData.append("variants", JSON.stringify(variantList));

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
                    {...register("price")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
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

          
           
            {/* Product Variants */}
            {variantList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Product Variants ({variantList.length})
                </h2>
                <div className="space-y-4">
                  {variantList.map((variant, vIdx) => (
                    <div key={vIdx} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Variant {vIdx + 1}</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleVariantEdit(vIdx)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            {editingVariant === vIdx ? 'Save' : 'Edit'}
                          </button>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                              value={variant.price || ''}
                              onChange={(e) => handleVariantEdit(vIdx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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