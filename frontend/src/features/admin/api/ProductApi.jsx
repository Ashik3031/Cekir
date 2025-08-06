import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const addProduct = (data) => axios.post(`${BASE_URL}/products`, data);
export const fetchProducts = () => axios.get(`${BASE_URL}/products`);
