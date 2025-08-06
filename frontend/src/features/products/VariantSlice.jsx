import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  variants: [],
  selectedVariant: null,
  status: "idle",
  error: null,
};

const variantSlice = createSlice({
  name: "variantSlice",
  initialState,
  reducers: {
    // ✅ Set variants from API response
    setVariants: (state, action) => {
      state.variants = action.payload;
      state.selectedVariant = action.payload.length > 0 ? action.payload[0] : null; // default first variant
    },

    // ✅ Set selected variant when user clicks a variant button
    setSelectedVariant: (state, action) => {
      state.selectedVariant = action.payload;
    },

    // ✅ Clear variants on unmount
    clearVariants: (state) => {
      state.variants = [];
      state.selectedVariant = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

// ✅ Actions
export const { setVariants, setSelectedVariant, clearVariants } = variantSlice.actions;

// ✅ Selectors
export const selectVariants = (state) => state.variants.variants;
export const selectSelectedVariant = (state) => state.variants.selectedVariant;
export const selectVariantStatus = (state) => state.variants.status;

// ✅ Reducer
export default variantSlice.reducer;
