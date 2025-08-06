import { useState, useEffect } from "react";
import { axiosi } from "../config/axios";

export const useProducts = ({ category, subCategory, sort, page, limit, skip = false }) => {
  const [products, setProducts] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (skip) return;

    const fetchProducts = async () => {
      try {
        setFetchStatus("pending");

        const params = {
          ...(category ? { category } : {}),
          ...(subCategory ? { subCategory } : {}),
          ...(sort?.sort ? { sort: sort.sort } : {}),
          ...(sort?.order ? { order: sort.order } : {}),
          page: page || 1,
          limit: limit || 10,
        };

        const response = await axiosi.get("/products", { params });
        setProducts(response.data);
        const total = Number(response.headers["x-total-count"]) || 0;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / limit));
        setFetchStatus("fulfilled");
      } catch (error) {
        console.error("Error fetching products:", error);
        setFetchStatus("error");
      }
    };

    fetchProducts();
  }, [category, subCategory, sort, page, limit, skip]);

  return { products, fetchStatus, totalCount, totalPages, currentPage: page };
};

