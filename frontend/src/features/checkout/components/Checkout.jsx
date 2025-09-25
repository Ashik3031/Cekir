/* eslint-disable no-unused-vars */
import {
  Stack,
  TextField,
  Typography,
  Button,
  Menu,
  MenuItem,
  Select,
  Grid,
  FormControl,
  Radio,
  Paper,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import { Cart } from "../../cart/components/Cart";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  addAddressAsync,
  selectAddressStatus,
  selectAddresses,
} from "../../address/AddressSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  createOrderAsync,
  selectCurrentOrder,
  selectOrderStatus,
} from "../../order/OrderSlice";
import { resetCartByUserIdAsync, selectCartItems } from "../../cart/CartSlice";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { SHIPPING } from "../../../constants";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { axiosi } from "../../../config/axios";

export const Checkout = () => {
  const addresses = useSelector(selectAddresses) || [];
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD"); // ✅ default matches checks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const addressStatus = useSelector(selectAddressStatus);
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems) || [];
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  // ✅ Safe total (works with variant or product-only items)
  const orderTotal =
    cartItems?.reduce((acc, item) => {
      const unit = item?.variant?.price ?? item?.product?.price ?? 0;
      const qty = item?.quantity ?? 0;
      return acc + unit * qty;
    }, 0) ?? 0;

  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const handleAddAddress = async (data) => {
    if (!loggedInUser?._id) {
      alert("Please log in first.");
      return;
    }
    const address = { ...data, user: loggedInUser._id };
    const resultAction = await dispatch(addAddressAsync(address));
    if (addAddressAsync.fulfilled.match(resultAction)) {
      reset();
    } else {
      alert("Error adding your address");
    }
  };

  const handleCreateOrder = async () => {
    // ✅ Guards
    if (!loggedInUser?._id) {
      alert("Please log in first.");
      return;
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (!selectedAddress?._id) {
      alert("Please select an address.");
      return;
    }
    if (!["COD", "CARD"].includes(selectedPaymentMethod)) {
      alert("Please choose a payment method.");
      return;
    }

    // ✅ Build items: prefer variantId; fallback to productId if your backend allows
    const builtItems = cartItems
      .map((item) => {
        const quantity = item?.quantity ?? 1;
        if (item?.variant?._id) {
          return { variantId: item.variant._id, quantity };
        }
        if (item?.product?._id) {
          // If backend supports product-only lines when no variant exists.
          return { productId: item.product._id, quantity };
        }
        return null;
      })
      .filter(Boolean);

    if (builtItems.length === 0) {
      console.error("Cart lines are missing variantId/productId:", cartItems);
      alert("There’s a problem with your cart items. Please re-add them.");
      return;
    }

    const orderData = {
      user: loggedInUser._id,
      items: builtItems,
      address: selectedAddress._id, // ✅ send ID only
      paymentMode: selectedPaymentMethod, // "COD" or "CARD"
      total: orderTotal + SHIPPING ,
    };

    if (selectedPaymentMethod === "COD") {
      try {
        const createdOrder = await dispatch(createOrderAsync(orderData)).unwrap();
        if (createdOrder?._id) {
          dispatch(resetCartByUserIdAsync(loggedInUser._id));
          navigate(`/order-success/${createdOrder._id}`);
        } else {
          throw new Error("Order creation did not return an _id");
        }
      } catch (err) {
        console.error("Failed to create order:", err);
        alert("Failed to place the order. Please try again.");
      }
    } else {
      // CARD flow
      try {
        const stripe = await loadStripe(
          "pk_test_51S0e5iR4kvEyPzGDrQhqTvS4p3GgDu47o3J2h3D3sv87YW1htUMEIawju2X8jNCzQS24gEUVUr9sTbDFWlNkmW8900bWvUSA78"
        );

        // Send a clean cart for Stripe line items
        // const sanitizedCart = cartItems.map((item) => ({
        //   variantId: item?.variant?._id ?? null,
        //   productId: item?.product?._id ?? null,
        //   quantity: item?.quantity ?? 1,
        //   name: item?.variant?.name ?? item?.product?.name ?? "Item",
        //   price: item?.variant?.price ?? item?.product?.price ?? 0,
        //   image:
        //     item?.variant?.images?.[0] ??
        //     item?.product?.defaultImages?.[0] ??
        //     null,
        // }));

         const products = cartItems.map((item) => ({
   quantity: item?.quantity ?? 1,
   // keep ids if you need them later in webhook/fulfillment
   variantId: item?.variant?._id ?? null,
   productId: item?.product?._id ?? null,
   product: {
     title: item?.variant?.name ?? item?.product?.name ?? "Item",
     price: item?.variant?.price ?? item?.product?.price ?? 0,
     image:
       item?.variant?.images?.[0] ??
       item?.product?.defaultImages?.[0] ??
       null,
   },
}));

        // const response = await axiosi.post(
        //   "/checkout/create-checkout-session",
        //   { cart: sanitizedCart, orderData },
        //   { headers: { "Content-Type": "application/json" } }
        // );

         const response = await axiosi.post(
   "/checkout/create-checkout-session",
   { products, orderData },
   { headers: { "Content-Type": "application/json" } }
 );

        if (response.status === 200) {
          const sessionId = response.data.id;
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            console.error("Stripe redirect error", error);
            alert("Payment failed. Please try again.");
          }
        } else {
          console.error("Stripe checkout error", response.data);
          alert("Unable to start checkout. Try again.");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (addressStatus === "fulfilled") {
      reset();
    } else if (addressStatus === "rejected") {
      alert("Error adding your address");
    }
  }, [addressStatus, reset]);

  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  return (
    <Stack
      flexDirection={"row"}
      p={2}
      rowGap={10}
      justifyContent={"center"}
      flexWrap={"wrap"}
      mb={"5rem"}
      mt={2}
      columnGap={4}
      alignItems={"flex-start"}
    >
      {/* left box */}
      <Stack rowGap={4}>
        {/* heading */}
        <Stack
          flexDirection={"row"}
          columnGap={is480 ? 0.3 : 1}
          alignItems={"center"}
        >
          <motion.div whileHover={{ x: -5 }}>
            <IconButton component={Link} to={"/cart"}>
              <ArrowBackIcon fontSize={is480 ? "medium" : "large"} />
            </IconButton>
          </motion.div>
          <Typography variant="h4">Shipping Information</Typography>
        </Stack>

        {/* address form */}
        <Stack
          component={"form"}
          noValidate
          rowGap={2}
          onSubmit={handleSubmit(handleAddAddress)}
        >
          <Stack>
            <Typography gutterBottom>Type</Typography>
            <TextField
              placeholder="Eg. Home, Business"
              {...register("type", { required: true })}
            />
          </Stack>

          <Stack>
            <Typography gutterBottom>Street</Typography>
            <TextField {...register("street", { required: true })} />
          </Stack>

          <Stack>
            <Typography gutterBottom>Country</Typography>
            <TextField {...register("country", { required: true })} />
          </Stack>

          <Stack>
            <Typography gutterBottom>Phone Number</Typography>
            <TextField
              type="number"
              {...register("phoneNumber", { required: true })}
            />
          </Stack>

          <Stack flexDirection={"row"} gap={2}>
            <Stack width={"100%"}>
              <Typography gutterBottom>City</Typography>
              <TextField {...register("city", { required: true })} />
            </Stack>
            <Stack width={"100%"}>
              <Typography gutterBottom>State</Typography>
              <TextField {...register("state", { required: true })} />
            </Stack>
            <Stack width={"100%"}>
              <Typography gutterBottom>Postal Code</Typography>
              <TextField
                type="number"
                {...register("postalCode", { required: true })}
              />
            </Stack>
          </Stack>

          <Stack flexDirection={"row"} alignSelf={"flex-end"} columnGap={1}>
            <LoadingButton
              loading={addressStatus === "pending"}
              type="submit"
              variant="contained"
            >
              add
            </LoadingButton>
            <Button color="error" variant="outlined" onClick={() => reset()}>
              Reset
            </Button>
          </Stack>
        </Stack>

        {/* existing address */}
        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6">Address</Typography>
            <Typography variant="body2" color={"text.secondary"}>
              Choose from existing addresses
            </Typography>
          </Stack>

          <Grid
            container
            gap={2}
            width={is900 ? "auto" : "50rem"}
            justifyContent={"flex-start"}
            alignContent={"flex-start"}
          >
            {addresses.map((address) => (
              <Grid item key={address._id}>
                <FormControl>
                  <Stack
                    p={is480 ? 2 : 2}
                    width={is480 ? "100%" : "20rem"}
                    height={is480 ? "auto" : "15rem"}
                    rowGap={2}
                    component={Paper}
                    elevation={1}
                  >
                    <Stack flexDirection={"row"} alignItems={"center"}>
                      <Radio
                        checked={selectedAddress?._id === address._id}
                        name="addressRadioGroup"
                        onChange={() => setSelectedAddress(address)}
                      />
                      <Typography>{address.type}</Typography>
                    </Stack>

                    {/* details */}
                    <Stack>
                      <Typography>{address.street}</Typography>
                      <Typography>
                        {address.state}, {address.city}, {address.country},{" "}
                        {address.postalCode}
                      </Typography>
                      <Typography>{address.phoneNumber}</Typography>
                    </Stack>
                  </Stack>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </Stack>

        {/* payment methods */}
        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6">Payment Methods</Typography>
            <Typography variant="body2" color={"text.secondary"}>
              Please select a payment method
            </Typography>
          </Stack>

          <Stack rowGap={2}>
            <Stack
              flexDirection={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
            >
              <Radio
                name="paymentMethod"
                checked={selectedPaymentMethod === "COD"}
                onChange={() => setSelectedPaymentMethod("COD")}
              />
              <Typography>Cash</Typography>
            </Stack>

            <Stack
              flexDirection={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
            >
              <Radio
                name="paymentMethod"
                checked={selectedPaymentMethod === "CARD"}
                onChange={() => setSelectedPaymentMethod("CARD")}
              />
              <Typography>Card</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* right box */}
      <Stack
        width={is900 ? "100%" : "auto"}
        alignItems={is900 ? "flex-start" : ""}
        gap={2}
      >
        <Typography variant="h4">Order summary</Typography>
        <Cart checkout={true} />
        <LoadingButton
          fullWidth
          loading={orderStatus === "pending"}
          variant="contained"
          size="large"
          onClick={handleCreateOrder}
          disabled={
            !loggedInUser?._id ||
            !selectedAddress?._id ||
            !cartItems?.length ||
            !["COD", "CARD"].includes(selectedPaymentMethod)
          }
        >
          Pay and order
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

// onClick={makePayment}
