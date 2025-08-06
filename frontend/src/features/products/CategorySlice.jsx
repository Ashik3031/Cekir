import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchCategory, addCategory } from "./CategoryApi";

const initialState = {
  categories: [],
  selectedCategory: null,
  status: "idle",
  addStatus: "idle",
  errors: null,
  successMessage: null,
};

export const fetchCategoryAsync = createAsyncThunk(
  "category/fetchCategoryAsync",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCategory();
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addCategoryAsync = createAsyncThunk(
  "category/addCategoryAsync",
  async (category, { rejectWithValue }) => {
    try {
      const data = await addCategory(category);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const categorySlice = createSlice({
  name: "CategorySlice",
  initialState,
  reducers: {
    clearCategoryErrors: (state) => {
      state.errors = null;
    },
    clearCategorySuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetCategoryStatus: (state) => {
      state.status = "idle";
    },
    resetAddCategoryStatus: (state) => {
      state.addStatus = "idle";
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchCategoryAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.categories = action.payload;
      })
      .addCase(fetchCategoryAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload;
      })

      .addCase(addCategoryAsync.pending, (state) => {
        state.addStatus = "pending";
      })
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.addStatus = "fulfilled";
        state.categories.push(action.payload);
        state.successMessage = "Category added successfully!";
      })
      .addCase(addCategoryAsync.rejected, (state, action) => {
        state.addStatus = "rejected";
        state.errors = action.payload;
      });
  },
});

// Selectors
export const selectCategories = (state) => state.CategorySlice.categories;
export const selectCategoryStatus = (state) => state.CategorySlice.status;
export const selectCategoryAddStatus = (state) => state.CategorySlice.addStatus;
export const selectCategoryErrors = (state) => state.CategorySlice.errors;
export const selectCategorySuccessMessage = (state) =>
  state.CategorySlice.successMessage;
export const selectSelectedCategory = (state) => state.CategorySlice.selectedCategory;

// Actions
export const {
  clearCategoryErrors,
  clearCategorySuccessMessage,
  resetCategoryStatus,
  resetAddCategoryStatus,
  clearSelectedCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
