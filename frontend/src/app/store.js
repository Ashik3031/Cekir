import {configureStore} from '@reduxjs/toolkit'
import AuthSlice from '../features/auth/AuthSlice'
import ProductSlice from '../features/products/ProductSlice'
import VariantSlice from '../features/products/VariantSlice'
import UserSlice from '../features/user/UserSlice'
import BrandSlice from '../features/brands/BrandSlice'
import categoriesReducer from '../features/categories/CategoriesSlice';
import CartSlice from '../features/cart/CartSlice'
import AddressSlice from '../features/address/AddressSlice'
import ReviewSlice from '../features/review/ReviewSlice'
import OrderSlice from '../features/order/OrderSlice'
import WishlistSlice from '../features/wishlist/WishlistSlice'

export const store=configureStore({
    reducer:{
        AuthSlice,
        ProductSlice,
        variants: VariantSlice,
        UserSlice,
        BrandSlice,
        categories: categoriesReducer,
        CartSlice,
        AddressSlice,
        ReviewSlice,
        OrderSlice,
        WishlistSlice
    }
})