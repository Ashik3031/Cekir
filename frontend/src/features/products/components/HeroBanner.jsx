/* eslint-disable react-hooks/exhaustive-deps */
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  Container,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectProductIsFilterOpen,
  selectProductTotalResults,
  selectProducts,
  toggleFilters,
} from "../ProductSlice.jsx";
import { ProductCard } from "./ProductCard.jsx";

import Pagination from "@mui/material/Pagination";
import { ITEMS_PER_PAGE } from "../../../constants/index.js";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItems,
} from "../../wishlist/WishlistSlice.jsx";

import { selectLoggedInUser } from "../../auth/AuthSlice.jsx";
import { toast } from "react-toastify";
import {
  banner1,
  banner2,
  banner3,
  banner4,
  loadingAnimation,
} from "../../../assets/index.js";
import {
  resetCartItemAddStatus,
  selectCartItemAddStatus,
} from "../../cart/CartSlice.jsx";
import { motion } from "framer-motion";
import { ProductBanner } from "./ProductBanner.jsx";

import Lottie from "lottie-react";

const sortOptions = [
  { name: "Price: low to high", sort: "price", order: "asc" },
  { name: "Price: high to low", sort: "price", order: "desc" },
];

const bannerImages = [banner1, banner3, banner2, banner4];

export const HeroBanner = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(null);
  const theme = useTheme();

  // Enhanced breakpoints for better mobile responsiveness
  const is1200 = useMediaQuery(theme.breakpoints.down(1200));
  const is800 = useMediaQuery(theme.breakpoints.down(800));
  const is700 = useMediaQuery(theme.breakpoints.down(700));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const is400 = useMediaQuery(theme.breakpoints.down(400));
  const is350 = useMediaQuery(theme.breakpoints.down(350));

  const products = useSelector(selectProducts);
  const [latestProducts, setLatestProducts] = useState([]);

  const totalResults = useSelector(selectProductTotalResults);
  const loggedInUser = useSelector(selectLoggedInUser);

  const productFetchStatus = useSelector(selectProductFetchStatus);

  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus);
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus);

  const cartItemAddStatus = useSelector(selectCartItemAddStatus);


  const dispatch = useDispatch();



 

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [totalResults]);

  useEffect(() => {
    const finalFilters = { ...filters };

    finalFilters["pagination"] = { page: page, limit: ITEMS_PER_PAGE };
    finalFilters["sort"] = sort;

    if (!loggedInUser?.isAdmin) {
      finalFilters["user"] = true;
    }

    dispatch(fetchProductsAsync(finalFilters));
  }, [filters, page, sort]);

  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      const data = { user: loggedInUser?._id, product: productId };
      dispatch(createWishlistItemAsync(data));
    } else if (!e.target.checked) {
      const index = wishlistItems.findIndex(
        (item) => item.product._id === productId
      );
      dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
    }
  };

  useEffect(() => {
    if (wishlistItemAddStatus === "fulfilled") {
      toast.success("Product added to wishlist");
    } else if (wishlistItemAddStatus === "rejected") {
      toast.error("Error adding product to wishlist, please try again later");
    }
  }, [wishlistItemAddStatus]);

  useEffect(() => {
    if (wishlistItemDeleteStatus === "fulfilled") {
      toast.success("Product removed from wishlist");
    } else if (wishlistItemDeleteStatus === "rejected") {
      toast.error(
        "Error removing product from wishlist, please try again later"
      );
    }
  }, [wishlistItemDeleteStatus]);

  useEffect(() => {
    if (cartItemAddStatus === "fulfilled") {
      toast.success("Product added to cart");
    } else if (cartItemAddStatus === "rejected") {
      toast.error("Error adding product to cart, please try again later");
    }
  }, [cartItemAddStatus]);

  useEffect(() => {
    if (productFetchStatus === "rejected") {
      toast.error("Error fetching products, please try again later");
    }
  }, [productFetchStatus]);

  useEffect(() => {
    return () => {
      dispatch(resetProductFetchStatus());
      dispatch(resetWishlistItemAddStatus());
      dispatch(resetWishlistItemDeleteStatus());
      dispatch(resetCartItemAddStatus());
    };
  }, []);

  const handleFilterClose = () => {
    dispatch(toggleFilters());
  };

  useEffect(() => {
    if (products.length > 0) {
      const sortedProducts = [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setLatestProducts(sortedProducts);
    }
  }, [products]);

  // Calculate dynamic banner height based on screen size - 70% of viewport height for mobile
  const getBannerHeight = () => {
    if (is600) return "70vh"; // Using viewport height for mobile devices
    if (is800) return "65vh";
    if (is1200) return "60vh";
    return "700px"; // Desktop size
  };

  // Calculate loader size based on screen width
  const getLoaderWidth = () => {
    if (is350) return "90%";
    if (is400) return "95%";
    if (is500) return "35vh";
    return "25rem";
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters={is480} 
      sx={{ 
        px: is480 ? 1 : is600 ? 2 : 3,
        overflow: "hidden"
      }}
    >
      {productFetchStatus === "pending" ? (
        <Stack
          width={getLoaderWidth()}
          height={"calc(100vh - 4rem)"}
          justifyContent={"center"}
          marginRight={"auto"}
          marginLeft={"auto"}
        >
          <Lottie animationData={loadingAnimation} />
        </Stack>
      ) : (
        <Box 
          component="section" 
          sx={{ 
            width: "100%",
            // Set a height constraint for mobile view to ensure banner takes proper space
            ...(is600 && {
              height: "100vh",
              display: "flex",
              flexDirection: "column"
            })
          }}
        >
          <Stack 
            spacing={is480 ? 2 : 3} 
            mb={is480 ? "1.5rem" : "3rem"}
            sx={{
              ...(is600 && {
                flex: 1
              })
            }}
          >
            {/* Banner section - now visible on all screen sizes with adaptive height */}
            <Box
              sx={{
                width: "100%",
                height: getBannerHeight(),
                overflow: "hidden",
                borderRadius: is350 ? "8px" : "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <ProductBanner images={bannerImages} />
              
              {/* Overlay text for banner - responsive font sizes */}
             
            </Box>
            
           
          </Stack>
        </Box>
      )}
    </Container>
  );
};