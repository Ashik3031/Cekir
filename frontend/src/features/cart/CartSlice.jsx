import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addToCart,
  fetchCartByUserId,
  updateCartItemById,
  deleteCartItemById,
  resetCartByUserId,
} from "./CartApi";

const initialState = {
  status: "idle",
  items: [],
  cartItemAddStatus: "idle",
  cartItemRemoveStatus: "idle",
  errors: null,
  successMessage: null,
};

// ✅ Add to cart using variant-based structure
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async ({ user, variant, quantity }) => {
    const addedItem = await addToCart({ user, variant, quantity });
    return addedItem;
  }
);

// ✅ Fetch all cart items for a user
export const fetchCartByUserIdAsync = createAsyncThunk(
  "cart/fetchCartByUserIdAsync",
  async (userId) => {
    const items = await fetchCartByUserId(userId);
    return items;
  }
);

// ✅ Update cart item quantity
export const updateCartItemByIdAsync = createAsyncThunk(
  "cart/updateCartItemByIdAsync",
  async ({ _id, quantity }) => {
    const updatedItem = await updateCartItemById({ _id, quantity });
    return updatedItem;
  }
);

// ✅ Delete a cart item
export const deleteCartItemByIdAsync = createAsyncThunk(
  "cart/deleteCartItemByIdAsync",
  async (_id) => {
    const deletedItem = await deleteCartItemById(_id);
    return deletedItem;
  }
);

// ✅ Reset all cart items for a user
export const resetCartByUserIdAsync = createAsyncThunk(
  "cart/resetCartByUserIdAsync",
  async (userId) => {
    const cleared = await resetCartByUserId(userId);
    return cleared;
  }
);

const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    resetCartItemAddStatus: (state) => {
      state.cartItemAddStatus = "idle";
    },
    resetCartItemRemoveStatus: (state) => {
      state.cartItemRemoveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.cartItemAddStatus = "pending";
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.cartItemAddStatus = "fulfilled";
        const exists = state.items.find(i => i._id === action.payload._id);
        if (!exists) state.items.push(action.payload);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.cartItemAddStatus = "rejected";
        state.errors = action.error;
      })

      // Fetch cart
      .addCase(fetchCartByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchCartByUserIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchCartByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      // Update quantity
      .addCase(updateCartItemByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateCartItemByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCartItemByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      // Delete item
      .addCase(deleteCartItemByIdAsync.pending, (state) => {
        state.cartItemRemoveStatus = "pending";
      })
      .addCase(deleteCartItemByIdAsync.fulfilled, (state, action) => {
        state.cartItemRemoveStatus = "fulfilled";
        state.items = state.items.filter(
          (item) => item._id !== action.payload._id
        );
      })
      .addCase(deleteCartItemByIdAsync.rejected, (state, action) => {
        state.cartItemRemoveStatus = "rejected";
        state.errors = action.error;
      })

      // Reset cart
      .addCase(resetCartByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(resetCartByUserIdAsync.fulfilled, (state) => {
        state.status = "fulfilled";
        state.items = [];
      })
      .addCase(resetCartByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      });
  },
});

// ✅ Selectors
export const selectCartStatus = (state) => state.CartSlice.status;
export const selectCartItems = (state) => state.CartSlice.items;
export const selectCartErrors = (state) => state.CartSlice.errors;
export const selectCartSuccessMessage = (state) =>
  state.CartSlice.successMessage;
export const selectCartItemAddStatus = (state) =>
  state.CartSlice.cartItemAddStatus;
export const selectCartItemRemoveStatus = (state) =>
  state.CartSlice.cartItemRemoveStatus;

// ✅ Actions
export const { resetCartItemAddStatus, resetCartItemRemoveStatus } =
  cartSlice.actions;

export default cartSlice.reducer;
