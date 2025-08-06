import {  useState } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/useProducts";
import { Grid, Pagination, Stack, useMediaQuery, Box } from "@mui/material";
import { useTheme } from "@emotion/react";
import { ProductCard } from "../components/ProductCard";
import Lottie from "lottie-react";
import { loadingAnimation } from "../../../assets";
import { useSelector, useDispatch } from "react-redux";
import { selectWishlistItems } from "../../wishlist/WishlistSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
} from "../../wishlist/WishlistSlice";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";


const SubcategoryLayout = ({ isFilterOpen = false }) => {
  const { categoryTitle, subcategoryTitle } = useParams();
  const outletContext = useOutletContext();
  const { categories = [], subCategories = [], sort } = outletContext || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const wishlistItems = useSelector(selectWishlistItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const [page, setPage] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  //lunu



  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Finding the current category and subcategory ids
  const currentCategory = categories.find(
    (category) => category.name.toLowerCase() === categoryTitle?.toLowerCase()
  );

  const currentSubCategory = subCategories.find(
    (subCategory) =>
      subCategory.name.toLowerCase() === subcategoryTitle?.toLowerCase()
  );

const shouldFetch = !!(currentCategory?._id && currentSubCategory?._id);

// Show a loader while waiting for category/subcategory to be resolved


  
  const { products, fetchStatus, totalPages } = useProducts({
    category: currentCategory?._id,
    subCategory: currentSubCategory?._id,
    sort,
    page: page,
    limit: 12,
    skip: !shouldFetch,
  });

if (!shouldFetch) {
  return (
    <Stack alignItems="center" justifyContent="center" height="50vh">
      <Lottie
        animationData={loadingAnimation}
        style={{ width: isMobile ? 150 : 200 }}
      />
    </Stack>
  );
}

  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      if (!loggedInUser) {
        navigate("/login");
      } else {
        const data = { user: loggedInUser._id, product: productId };
        dispatch(createWishlistItemAsync(data));
      }
    } else {
      const index = wishlistItems.findIndex(
        (item) => item.product._id === productId
      );
      if (index !== -1) {
        dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
      }
    }
  };

  if (fetchStatus === "loading" || fetchStatus === "pending") {
    return (
      <Stack alignItems="center" justifyContent="center" height="50vh">
        <Lottie
          animationData={loadingAnimation}
          style={{ width: isMobile ? 150 : 200 }}
        />
      </Stack>
    );
  }

  if (fetchStatus === "error") {
    return (
      <Stack alignItems="center" justifyContent="center" height="50vh">
        <p className="text-center text-gray-500 p-4 text-lg">
          Products are coming soon. Stay tuned!
        </p>
      </Stack>
    );
  }

  if (fetchStatus === "fulfilled" && (!products || products.length === 0)) {
    return (
      <Stack alignItems="center" justifyContent="center" height="50vh" spacing={2}>
        <div style={{ width: 200, height: 200 }}>
          <DotLottieReact
            src="https://lottie.host/269f41d8-b5c8-455c-9792-a7f0a828f1e7/m5DumKEtjE.lottie"
            loop
            autoplay
            
          />
        </div>
        <p className="text-center text-gray-500 text-lg">
          Products are coming soon. Stay tuned!
        </p>
      </Stack>
    );
  }
  
  const getGridSizes = () => {
    if (isMobile) {
      return { xs: 12 };
    }
    if (isTablet) {
      return { xs: 12, sm: isFilterOpen ? 12 : 6 };
    }

    return {
      xs: 12,
      sm: 6,
      md: isFilterOpen ? 6 : 4,
      lg: isFilterOpen ? 4 : 3,
    };
  };

  const gridSizes = getGridSizes();

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <Grid
        container
        spacing={isMobile ? 1 : 2}
        justifyContent={isMobile ? "center" : "flex-start"}
        sx={{
          padding: isMobile ? "8px" : "16px",
          margin: 0, // Reset margin to prevent overflow
          width: "100%", // Ensure grid takes full width
        }}
      >
        {products.map((product) => (
          <Grid
            item
            {...gridSizes}
            key={product._id}
            sx={{
              padding: isMobile ? "4px" : undefined,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ProductCard
              id={product._id}
              title={product.title}
              thumbnail={product.thumbnail}
              price={product.price}
              description={product.description}
              handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
              onClick={() => navigate(`/product-details/${product._id}`)}
            />
          </Grid>
        ))}
      </Grid>

      <Stack
        spacing={2}
        alignItems={"center"}
        sx={{ marginTop: 3, marginBottom: 3 }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>
    </Box>
  );
};

export default SubcategoryLayout;
