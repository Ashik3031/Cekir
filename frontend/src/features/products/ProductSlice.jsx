import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addProduct,
  deleteProductById,
  fetchProductById,
  fetchProducts,
  toggleProductFeatured,
  undeleteProductById,
  updateProductById,
  softDeleteProductById,
} from "./ProductApi";

import { setVariants } from "../../features/products/VariantSlice";

const initialState = {
  status: "idle",
  productUpdateStatus: "idle",
  productAddStatus: "idle",
  productFetchStatus: "idle",
  products: [],
  totalResults: 0,
  isFilterOpen: false,
  selectedProduct: null,
  errors: null,
  successMessage: null,
  featuredProducts: [],
};



export const addProductAsync = createAsyncThunk(
  "products/addProductAsync",
  async (data) => {
    const addedProduct = await addProduct(data);
    return addedProduct;
  }
);


export const fetchProductsAsync = createAsyncThunk(
  "products/fetchProductsAsync",
  async (filters) => {
    const products = await fetchProducts(filters);
    return products;
  }
);


export const fetchProductByIdAsync = createAsyncThunk(
  "products/fetchProductByIdAsync",
  async (id, { dispatch }) => {
    const response = await fetchProductById(id); // { product, variants }
    dispatch(setVariants(response.variants)); // ✅ send variants to VariantSlice
    return response.product; // ✅ return only product
  }
);



export const updateProductByIdAsync = createAsyncThunk(
  "products/updateProductByIdAsync",
  async (update) => {
    const updatedProduct = await updateProductById(update);
    return updatedProduct;
  }
);
// soft delete call
export const softDeleteProductByIdAsync = createAsyncThunk(
  "products/softDeleteProductByIdAsync",
  async (id) => {
    const deletedProduct = await softDeleteProductById(id);
    return deletedProduct;
  }
);
export const undeleteProductByIdAsync = createAsyncThunk(
  "products/undeleteProductByIdAsync",
  async (id) => {
    const unDeletedProduct = await undeleteProductById(id);
    return unDeletedProduct;
  }
);
export const deleteProductByIdAsync = createAsyncThunk(
  "products/deleteProductByIdAsync",
  async (id) => {
    const deletedProduct = await deleteProductById(id);
    return deletedProduct;
  }
);

//toggle feature call
export const toggleProductFeaturedAsync = createAsyncThunk(
  "products/toggleProductFeaturedAsync",
  async ({ id, isFeatured }, { rejectWithValue }) => {
    try {
      const updatedProduct = await toggleProductFeatured(id, isFeatured);
      return updatedProduct;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// featured products getting call
export const fetchFeaturedProductsAsync = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async () => {
    try {
      const featuredProducts = await fetchProducts({ isFeatured: true });
      return featuredProducts;
    } catch (err) {
      return err.response.data;
    }
  }
);


const productSlice = createSlice({
  name: "productSlice",
  initialState: initialState,
  reducers: {
    clearProductErrors: (state) => {
      state.errors = null;
    },
    clearProductSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetProductStatus: (state) => {
      state.status = "idle";
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    resetProductUpdateStatus: (state) => {
      state.productUpdateStatus = "idle";
    },
    resetProductAddStatus: (state) => {
      state.productAddStatus = "idle";
    },
    toggleFilters: (state) => {
      state.isFilterOpen = !state.isFilterOpen;
    },
    resetProductFetchStatus: (state) => {
      state.productFetchStatus = "idle";
    },
    toggleFeatured: (state, action) => {
      const productId = action.payload;
      const featuredProducts = state.featuredProducts;
      if (featuredProducts.includes(productId)) {
        state.featuredProducts = featuredProducts.filter(
          (id) => id !== productId
        );
      } else {
        state.featuredProducts.push(productId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProductAsync.fulfilled, (state, action) => {
        state.productAddStatus = "fullfilled";
        state.products.push(action.payload);
      })
      .addCase(addProductAsync.rejected, (state, action) => {
        state.productAddStatus = "rejected";
        state.errors = action.error;
      })

      .addCase(fetchProductsAsync.pending, (state) => {
        state.productFetchStatus = "pending";
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.productFetchStatus = "fullfilled";
        state.products = action.payload.data;
        state.totalResults = action.payload.totalResults;
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.productFetchStatus = "rejected";
        state.errors = action.error;
      })

      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.productFetchStatus = "pending";
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.productFetchStatus = "fullfilled";
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductByIdAsync.rejected, (state, action) => {
        state.productFetchStatus = "rejected";
        state.errors = action.error;
      })

      .addCase(updateProductByIdAsync.pending, (state) => {
        state.productUpdateStatus = "pending";
      })
      .addCase(updateProductByIdAsync.fulfilled, (state, action) => {
        state.productUpdateStatus = "fullfilled";
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        state.products[index] = action.payload;
      })
      .addCase(updateProductByIdAsync.rejected, (state, action) => {
        state.productUpdateStatus = "rejected";
        state.errors = action.error;
      })
      // soft delete
      .addCase(softDeleteProductByIdAsync.pending, (state) => {
      state.status = "pending";
      })
      .addCase(softDeleteProductByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(softDeleteProductByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })
      .addCase(undeleteProductByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(undeleteProductByIdAsync.fulfilled, (state, action) => {
        state.status = "fullfilled";
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        state.products[index] = action.payload;
      })
      .addCase(undeleteProductByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      .addCase(deleteProductByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteProductByIdAsync.fulfilled, (state, action) => {
  state.status = "fulfilled";
  const idToDelete = action.payload._id;
  state.products = state.products.filter(product => product._id !== idToDelete);
})
      .addCase(deleteProductByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })
      .addCase(toggleProductFeaturedAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(toggleProductFeaturedAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(toggleProductFeaturedAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload;
      })
      .addCase(fetchFeaturedProductsAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchFeaturedProductsAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.featuredProducts = action.payload.data; // Assuming API response structure
      })
      .addCase(fetchFeaturedProductsAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      });
  },
});

// exporting selectors
export const selectProductStatus = (state) => state.ProductSlice.status;

export const selectProducts = (state) => state.ProductSlice.products;

export const selectProductTotalResults = (state) =>
  state.ProductSlice.totalResults;


export const selectSelectedProduct = (state) =>
  state.ProductSlice.selectedProduct;


export const selectProductErrors = (state) => state.ProductSlice.errors;

export const selectProductSuccessMessage = (state) =>
  state.ProductSlice.successMessage;

export const selectProductUpdateStatus = (state) =>
  state.ProductSlice.productUpdateStatus;
export const selectProductAddStatus = (state) =>
  state.ProductSlice.productAddStatus;
export const selectProductIsFilterOpen = (state) =>
  state.ProductSlice.isFilterOpen;
export const selectProductFetchStatus = (state) =>
  state.ProductSlice.productFetchStatus;
export const selectFeaturedProducts = (state) =>
  state.ProductSlice.featuredProducts;

// exporting actions
export const {
  clearProductSuccessMessage,
  clearProductErrors,
  clearSelectedProduct,
  resetProductStatus,
  resetProductUpdateStatus,
  resetProductAddStatus,
  toggleFilters,
  resetProductFetchStatus,
} = productSlice.actions;

export default productSlice.reducer;