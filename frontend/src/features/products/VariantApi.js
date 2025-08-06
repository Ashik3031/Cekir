import { axiosi } from "../../config/axios";

// ✅ Get Variants by Product ID
export const fetchVariantsByProductId = async (productId) => {
  try {
    const res = await axiosi.get(`/variants/product/${productId}`);
    return res.data; // Array of variants
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Add Variant
export const addVariant = async (data) => {
  const res = await axiosi.post("/variants", data);
  return res.data;
};

// ✅ Update Variant
export const updateVariant = async (id, data) => {
  const res = await axiosi.put(`/variants/${id}`, data);
  return res.data;
};

// ✅ Delete Variant
export const deleteVariant = async (id) => {
  const res = await axiosi.delete(`/variants/${id}`);
  return res.data;
};
