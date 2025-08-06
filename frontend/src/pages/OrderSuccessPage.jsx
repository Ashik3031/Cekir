import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetCurrentOrder, selectCurrentOrder } from "../features/order/OrderSlice";
import { selectUserInfo } from "../features/user/UserSlice";
import { axiosi } from "../config/axios";
import { Button, Stack, Typography, Paper, Box, Divider } from "@mui/material";
import Lottie from "lottie-react";
import { orderSuccessAnimation } from "../assets";

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userDetails = useSelector(selectUserInfo);
  const currentOrder = useSelector(selectCurrentOrder);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        let response;

        if (id?.startsWith("cs_")) {
          response = await axiosi.get(`/checkout/get-order?session_id=${id}`);
        } else if (id) {
          response = await axiosi.get(`/orders/${id}`);
        } else if (userDetails?._id) {
          response = await axiosi.get(`/orders/user/${userDetails._id}`);
          if (response.data.length > 0) {
            response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            response = { data: { order: response.data[0] } };
          } else {
            throw new Error("No orders found.");
          }
        }

        setOrder(response.data.order);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to fetch order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, userDetails]);

  useEffect(() => {
    return () => {
      dispatch(resetCurrentOrder());
    };
  }, [dispatch]);

  const orderNumber = order?.orderNo ? `#${order.orderNo}` : "N/A";

  if (loading) {
    return (
      <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center">
        <Typography variant="body1">Loading order details...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center" rowGap={2}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button component={Link} to="/" variant="contained">Go to Home</Button>
      </Stack>
    );
  }

  return (
    <Stack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f8f9fa"
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "#ffffff"
        }}
      >
        <Box width={120} mx="auto">
          <Lottie animationData={orderSuccessAnimation} />
        </Box>

        <Typography variant="h6" mt={2} fontWeight={600}>
          Hi {userDetails?.name || "there"} 👋
        </Typography>

        <Typography variant="h5" fontWeight="bold" mt={1}>
          Order {orderNumber} Confirmed!
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
          Thank you for shopping with us. We’ll notify you when it ships.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          variant="contained"
          size="large"
          component={Link}
          to="/orders"
          onClick={() => dispatch(resetCurrentOrder())}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          View My Orders
        </Button>

        <Button
          fullWidth
          variant="text"
          component={Link}
          to="/"
          sx={{ mt: 1, fontSize: "0.9rem" }}
        >
          Continue Shopping
        </Button>
      </Paper>
    </Stack>
  );
};
