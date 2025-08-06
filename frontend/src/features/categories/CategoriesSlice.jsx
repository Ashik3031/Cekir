import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllCategories, addCategory, addSubcategory, deleteCategory, deleteSubcategory } from './CategoriesApi';

const initialState = {
  status: 'idle',             // fetch categories
  addStatus: 'idle',          // add category
  addSubStatus: 'idle',       // add subcategory
  categories: [],
  errors: null,
  successMessage: null,
};

// Fetch all categories
export const fetchAllCategoriesAsync = createAsyncThunk(
  'categories/fetchAllCategoriesAsync',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await fetchAllCategories();
      return categories;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Add category
export const addCategoriesAsync = createAsyncThunk(
  'categories/addCategoriesAsync',
  async (category, { rejectWithValue }) => {
    try {
      const data = await addCategory(category);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Add subcategory
export const addSubcategoryAsync = createAsyncThunk(
  'categories/addSubcategoryAsync',
  async (subData, { rejectWithValue }) => {
    try {
      const data = await addSubcategory(subData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

//delete category
export const deleteCategoryAsync = createAsyncThunk(
    'categories/deleteCategoryAsync',
    async (id, { rejectWithValue }) => {
        try {
            const data = await deleteCategory(id);
            return { id, message: data.message };
        }catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
)

//delete subcategory
export const deleteSubcategoryAsync = createAsyncThunk(
  'categories/deleteSubcategoryAsync',
  async ({ subcategoryId, categoryId }, { rejectWithValue }) => {
    try {
      const data = await deleteSubcategory(subcategoryId);
      return { subcategoryId, categoryId, message: data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'categorySlice',
  initialState,
  reducers: {
    clearCategoryErrors: (state) => {
      state.errors = null;
    },
    clearCategorySuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetAddCategoryStatus: (state) => {
      state.addStatus = 'idle';
    },
    resetAddSubcategoryStatus: (state) => {
      state.addSubStatus = 'idle';
    },
    resetFetchCategoryStatus: (state) => {
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchAllCategoriesAsync.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAllCategoriesAsync.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.categories = action.payload;
      })
      .addCase(fetchAllCategoriesAsync.rejected, (state, action) => {
        state.status = 'rejected';
        state.errors = action.payload;
      })

      // Add category
      .addCase(addCategoriesAsync.pending, (state) => {
        state.addStatus = 'pending';
      })
      .addCase(addCategoriesAsync.fulfilled, (state, action) => {
        state.addStatus = 'fulfilled';
        state.categories.push(action.payload);
        state.successMessage = 'Category added successfully!';
      })
      .addCase(addCategoriesAsync.rejected, (state, action) => {
        state.addStatus = 'rejected';
        state.errors = action.payload;
      })

      // Add subcategory
      .addCase(addSubcategoryAsync.pending, (state) => {
        state.addSubStatus = 'pending';
      })
      .addCase(addSubcategoryAsync.fulfilled, (state, action) => {
        state.addSubStatus = 'fulfilled';
        state.successMessage = 'Subcategory added successfully!';

        // Optional: update subCategory in the correct category if needed
        const updatedCategoryIndex = state.categories.findIndex(
          (cat) => cat._id === action.payload.categoryId
        );
        if (updatedCategoryIndex !== -1) {
          state.categories[updatedCategoryIndex].subCategory.push(action.payload.subCategory);
        }
      })
      .addCase(addSubcategoryAsync.rejected, (state, action) => {
        state.addSubStatus = 'rejected';
        state.errors = action.payload;
      })
      // Delete Category
.addCase(deleteCategoryAsync.fulfilled, (state, action) => {
  state.categories = state.categories.filter(cat => cat._id !== action.payload.id);
  state.successMessage = action.payload.message;
})
.addCase(deleteCategoryAsync.rejected, (state, action) => {
  state.errors = action.payload;
})

// Delete Subcategory
.addCase(deleteSubcategoryAsync.fulfilled, (state, action) => {
  const { subcategoryId, categoryId, message } = action.payload;
  const category = state.categories.find(cat => cat._id === categoryId);
  if (category) {
    category.subCategory = category.subCategory.filter(sub => sub._id !== subcategoryId);
  }
  state.successMessage = message;
})
.addCase(deleteSubcategoryAsync.rejected, (state, action) => {
  state.errors = action.payload;
});
      
  },
});

// Selectors
export const selectCategoryStatus = (state) => state.categories.status;
export const selectCategoryAddStatus = (state) => state.categories.addStatus;
export const selectSubcategoryAddStatus = (state) => state.categories.addSubStatus;
export const selectCategories = (state) => state.categories.categories;
export const selectCategoryErrors = (state) => state.categories.errors;
export const selectCategorySuccessMessage = (state) => state.categories.successMessage;

// Actions
export const {
  clearCategoryErrors,
  clearCategorySuccessMessage,
  resetAddCategoryStatus,
  resetAddSubcategoryStatus,
  resetFetchCategoryStatus,
} = categorySlice.actions;

export default categorySlice.reducer;
