/* eslint-disable array-callback-return */
import { axiosi } from "../../config/axios";

export const addProduct = async (data) => {
  try {
    const res = await axiosi.post("/products", data);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const fetchProducts = async (filters) => {
  let queryString = "";

  if (filters.isFeatured) {
    queryString += `isFeatured=${filters.isFeatured}&`;
  }

  if (filters.category) {
    filters.category.forEach((cat) => {
      queryString += `category=${cat}&`;
    });
  }

  //newly added: lunu
  if (filters.subcategory) {
    filters.subcategory.forEach((subcat) => {
      queryString += `subCategory=${subcat}&`;
    });
  }
  if (filters.pagination) {
    queryString += `page=${filters.pagination.page}&limit=${filters.pagination.limit}&`;
  }

  if (filters.sort) {
    queryString += `sort=${filters.sort.sort}&order=${filters.sort.order}&`;
  }

  if (filters.user) {
    queryString += `user=${filters.user}&`;
  }

  try {
    const res = await axiosi.get(`/products?${queryString}`);
    // const totalResults = await res.headers.get("X-Total-Count");
    const totalResults = res.headers["x-total-count"];
    return { data: res.data, totalResults: totalResults };
  } catch (error) {
    throw error.response.data;
  }
};


export const fetchProductById = async (id) => {
  try {
    const res = await axiosi.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateProductById = async (update) => {
  try {
    const res = await axiosi.patch(`/products/${update.get("_id")}`, update);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
// Soft delete (hide)
export const softDeleteProductById = async (id) => {
  try {
    const res = await axiosi.patch(`/products/hide/${id}`);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const undeleteProductById = async (id) => {
  try {
    const res = await axiosi.patch(`/products/unhide/${id}`);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const deleteProductById = async (id) => {
  try {
    const res = await axiosi.delete(`/products/${id}`);
    return res.data?._id ? res.data : { _id: id };
  } catch (error) {
    throw error.response.data;
  }
};

export const toggleProductFeatured = async (id, isFeatured) => {
  try {
    const res = await axiosi.patch(`/products/featured/${id}`, { isFeatured });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const fetchProductSuggestions = async (query) => {
  try {
    const res = await axiosi.get(`/products/suggestions/${query}`);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const fetchSearchResults = async (query) => {
  try {
    const res = await axiosi.get(`/products/search?q=${query}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};