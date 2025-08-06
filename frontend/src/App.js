import { useSelector } from "react-redux";
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { Logout } from "./features/auth/components/Logout";
import { Protected } from "./features/auth/components/Protected";
import {
  selectIsAuthChecked,
  selectLoggedInUser,
} from "./features/auth/AuthSlice";

import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";

import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import {
  AddProductPage,
  AdminOrdersPage,
  CartPage,
  CheckoutPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  OrderSuccessPage,
  OtpVerificationPage,
  ProductDetailsPage,
  ProductUpdatePage,
  ResetPasswordPage,
  SignupPage,
  UserOrdersPage,
  UserProfilePage,
  WishlistPage,
} from "./pages";
import { AdminCateogryPage } from "./pages/AdminCategoryPage";


import CategroryLayout from "./features/products/pages/CategoryLayout";
import SubcategoryLayout from "./features/products/pages/SubCategoryLayout";
import { AboutUsPage } from "./pages/AboutUsPage";
import { ContactUsPage } from "./pages/ContactUsPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import NewArrivalsLayout from "./features/products/pages/NewArrivalsLayout";
import PaymentProcessing from "./features/checkout/components/PaymentProcessing";
import AddCategory from "./features/admin/components/AddCategory";

function App() {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const loggedInUser = useSelector(selectLoggedInUser);

  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:userId/:passwordResetToken"  element={<ResetPasswordPage />} />
        <Route exact  path="/logout"  element={  <Protected>   <Logout /> </Protected> } />
        <Route  exact  path="/product-details/:id"  element={<ProductDetailsPage />} />
        <Route path="/categories/:categoryTitle" element={<CategroryLayout />}>
          <Route path=":subcategoryTitle" element={<SubcategoryLayout />} />
        </Route>
        <Route path="/categories/all" element={<CategroryLayout />}></Route>
        <Route path="/categories" element={<CategroryLayout />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/new-arrivals/:categoryTitle" element={<NewArrivalsLayout />} />

        {loggedInUser?.isAdmin ? (
          // admin routes
          <>
            <Route path="/admin/dashboard"  element={ <Protected>  <AdminDashboardPage />  </Protected>  } />
            <Route  path="/admin/product-update/:id" element={  <Protected>  <ProductUpdatePage /> </Protected>  } />
            <Route path="/admin/add-product" element={ <Protected> <AddProductPage /></Protected>}/>
            <Route path="/admin/add-category" element={ <Protected> <AddCategory /></Protected>}/>
            <Route path="/admin/orders" element={<Protected> <AdminOrdersPage /></Protected>  } /> 
            <Route path="/admin/category" element={ <Protected> <AdminCateogryPage /></Protected>}/>
            <Route path="*" element={<Navigate to={"/admin/dashboard"} />} />
          </>
        ) : (
          // user routes
          <>
            {/* <Route path='/' element={<Protected><HomePage/></Protected>}/> */}
            <Route path="/cart" element={ <Protected> <CartPage /> </Protected> } />
            <Route path="/profile"element={ <Protected> <UserProfilePage /> </Protected> } />
            <Route  path="/checkout" element={ <Protected>  <CheckoutPage />  </Protected> }  />
            <Route path="/payment-processing" element={<PaymentProcessing />} />
            <Route path="/order-success/:id" element={ <Protected>  <OrderSuccessPage />  </Protected> } />
            <Route  path="/orders"  element={ <Protected> <UserOrdersPage />  </Protected> } />
            <Route path="/wishlist" element={ <Protected> <WishlistPage />  </Protected>    } />
          </>
        )}

        <Route path="*" element={<NotFoundPage />} />
      </>
    )
  );

  return isAuthChecked ? <RouterProvider router={routes} /> : "";
}

export default App;

// user
// pahasi2898@datingel.com
// Test@123

//admin
// demo@gmail.com
// helloWorld@123



//production database
// user
// pepal59525@gufutu.com
// helloWorld@123


// admin
// d7fvhl0vdn@zvvzuv.com
// helloWorld@123


// production database test
// sefov14286@bariswc.com
// helloWorld@123
