import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderByUserIdAsync,
  resetOrderFetchStatus,
  selectOrderFetchStatus,
  selectOrders,
} from "../OrderSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import {
  Button,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Divider
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  addToCartAsync,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems,
} from "../../cart/CartSlice";
import Lottie from "lottie-react";
import { loadingAnimation, noOrdersAnimation } from "../../../assets";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";

export const UserOrders = () => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const orders = useSelector(selectOrders) || [];
  const cartItems = useSelector(selectCartItems);
  const orderFetchStatus = useSelector(selectOrderFetchStatus);
  const cartItemAddStatus = useSelector(selectCartItemAddStatus);

  const theme = useTheme();
  const is1200 = useMediaQuery(theme.breakpoints.down("1200"));
  const is768 = useMediaQuery(theme.breakpoints.down("768"));
  const is660 = useMediaQuery(theme.breakpoints.down(660));
  const is480 = useMediaQuery(theme.breakpoints.down("480"));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (loggedInUser?._id) {
      dispatch(getOrderByUserIdAsync(loggedInUser._id));
    }
  }, [dispatch, loggedInUser]);

  useEffect(() => {
    if (cartItemAddStatus === "fulfilled") {
      toast.success("Product added to cart");
    } else if (cartItemAddStatus === "rejected") {
      toast.error("Error adding product to cart, please try again later");
    }
  }, [cartItemAddStatus]);

  useEffect(() => {
    if (orderFetchStatus === "rejected") {
      toast.error("Error fetching orders, please try again later");
    }
  }, [orderFetchStatus]);

  useEffect(() => {
    return () => {
      dispatch(resetOrderFetchStatus());
      dispatch(resetCartItemAddStatus());
    };
  }, []);

  const handleAddToCart = (product) => {
    if (!loggedInUser?._id) {
      toast.error("You need to be logged in to add items to the cart");
      return;
    }
    const item = { user: loggedInUser._id, product: product._id, quantity: 1 };
    dispatch(addToCartAsync(item));
  };

  return (
    <Stack justifyContent={"center"} alignItems={"center"}>
      {orderFetchStatus === "pending" ? (
        <Stack
          width={is480 ? "auto" : "25rem"}
          height={"calc(100vh - 4rem)"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Lottie animationData={loadingAnimation} />
        </Stack>
      ) : (
        <Stack width={is1200 ? "auto" : "60rem"} p={is480 ? 2 : 4} mb={"5rem"}>
          <Stack flexDirection={"row"} columnGap={2}>
            {!is480 && (
              <motion.div whileHover={{ x: -5 }} style={{ alignSelf: "center" }}>
                <IconButton component={Link} to={"/"}>
                  <ArrowBackIcon fontSize="large" />
                </IconButton>
              </motion.div>
            )}
            <Stack rowGap={1}>
              <Typography variant="h4" fontWeight={500}>
                Order History
              </Typography>
              <Typography sx={{ wordWrap: "break-word" }} color={"text.secondary"}>
                Check the status of recent orders, manage returns, and discover similar products.
              </Typography>
            </Stack>
          </Stack>

          <Stack mt={5} rowGap={5}>
            {orders.length > 0 ? (
              orders.map((order) => (
                <Stack
                  key={order._id}
                  p={2}
                  borderRadius={2}
                  border={"1px solid #eee"}
                  bgcolor={"white"}
                  rowGap={3}
                >
                  <Stack
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    flexWrap={"wrap"}
                    rowGap={2}
                  >
                    <Stack flexDirection={"row"} columnGap={4} flexWrap={"wrap"} rowGap={2}>
                      <Stack>
                        <Typography variant="body2" fontWeight={500}>Order Number</Typography>
                        <Typography color="text.secondary">{order._id}</Typography>
                      </Stack>
                      <Stack>
                        <Typography variant="body2" fontWeight={500}>Date Placed</Typography>
                        <Typography color="text.secondary">
                          {new Date(order.createdAt).toDateString()}
                        </Typography>
                      </Stack>
                      <Stack>
                        <Typography variant="body2" fontWeight={500}>Total</Typography>
                        <Typography>AED {order.total.toFixed(2)}</Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2">Items: {order?.items?.length || 0}</Typography>
                  </Stack>

                  <Divider />

                  <Stack rowGap={2}>
                    {order.items?.map((product) => (
                      <Stack
                        key={product._id}
                        flexDirection={"row"}
                        columnGap={3}
                        rowGap={is768 ? 2 : 0}
                        flexWrap={is768 ? "wrap" : "nowrap"}
                        alignItems={"flex-start"}
                      >
                        <img
                          src={product?.variant?.images?.[0] || "/placeholder.png"}
                          alt={product?.variant?.product?.title}
                          style={{ width: 120, height: 120, objectFit: "contain" }}
                        />

                        <Stack width={"100%"} rowGap={1}>
                          <Stack
                            flexDirection={"row"}
                            justifyContent={"space-between"}
                            flexWrap={"wrap"}
                          >
                            <Typography fontWeight={500}>{product?.variant?.product?.title}</Typography>
                            <Typography>AED {product?.variant?.price?.toFixed(2)}</Typography>
                          </Stack>
                          <Typography color="text.secondary" variant="body2">
                            Qty: {product.quantity}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {Object.entries(product?.variant?.optionValues || {})
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(" | ")}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {product?.variant?.product?.description}
                          </Typography>
                          <Stack flexDirection="row" columnGap={2} mt={1}>
                            <Button
                              size="small"
                              component={Link}
                              to={`/product-details/${product?.variant?.product?._id}`}
                              variant="outlined"
                            >
                              View Product
                            </Button>
                            {cartItems.some(
                              (cartItem) =>
                                cartItem?.product &&
                                product?.variant?.product &&
                                cartItem.product._id === product.variant.product._id
                            ) && (
                              <Button
                                size="small"
                                variant="contained"
                                component={Link}
                                to={"/cart"}
                              >
                                Already in Cart
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>

                  <Divider />

                  <Typography variant="body2" color="text.secondary">
                    Status: {order.status}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Stack mt={is480 ? "2rem" : 0} mb={"7rem"} alignSelf={"center"} rowGap={2}>
                <Stack width={is660 ? "auto" : "30rem"} height={is660 ? "auto" : "30rem"}>
                  <Lottie animationData={noOrdersAnimation} />
                </Stack>
                <Typography textAlign={"center"} alignSelf={"center"} variant="h6">
                  Oh! Looks like you haven't been shopping lately
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
