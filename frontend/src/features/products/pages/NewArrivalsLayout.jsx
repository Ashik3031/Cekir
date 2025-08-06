import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { axiosi } from "../../../config/axios";
import { Navbar } from "../../navigation/components/Navbar";
import {
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { ProductCard } from "../components/ProductCard";
import Lottie from "lottie-react";
import { loadingAnimation } from "../../../assets";
import {
  selectWishlistItems,
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
} from "../../wishlist/WishlistSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const NewArrivalsLayout = ({ isFilterOpen = false }) => {
  const { categoryTitle } = useParams();
  const [products, setProducts] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [sort, setSort] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const loggedInUser = useSelector(selectLoggedInUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const sortOptions = [
    { name: "Price: low to high", sort: "price", order: "asc" },
    { name: "Price: high to low", sort: "price", order: "desc" },
  ];

  useEffect(() => {
    const fetchNewArrivalProducts = async () => {
      try {
        setFetchStatus("pending");

        const response = await axiosi.get(
          `/products/latest-products/${categoryTitle}`,
          {
            params: {
              sort: sort?.sort,
              order: sort?.order,
            },
          }
        );

        setProducts(response.data);
        setFetchStatus("fulfilled");
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        setFetchStatus("error");
      }
    };

    fetchNewArrivalProducts();
  }, [categoryTitle, sort]);

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
    <>
      <Navbar />
      <div className="flex flex-col h-screen pt-[65px]">
        <div className="flex-1 p-3 sm:p-6 bg-gray-50 overflow-y-auto">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <h1 className="text-2xl font-bold capitalize">
              {categoryTitle} - Products
            </h1>

            <FormControl variant="standard" sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sort?.name || ""}
                onChange={(e) =>
                  setSort(sortOptions.find((o) => o.name === e.target.value))
                }
              >
                <MenuItem value="">Reset</MenuItem>
                {sortOptions.map((option) => (
                  <MenuItem key={option.name} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {fetchStatus === "pending" ? (
            <Stack alignItems="center" justifyContent="center" height="50vh">
              <Lottie
                animationData={loadingAnimation}
                style={{ width: isMobile ? 150 : 200 }}
              />
            </Stack>
          ) : fetchStatus === "error" ? (
            <p className="text-center text-red-500">
              Failed to load products. Please try again later.
            </p>
          ) : products.length > 0 ? (
            <Grid container spacing={isMobile ? 1 : 2}>
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
                    handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                    onClick={() => navigate(`/product-details/${product._id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              height="50vh"
              spacing={2}
            >
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
          )}
        </div>
      </div>
    </>
  );
};

export default NewArrivalsLayout;
