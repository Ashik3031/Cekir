import React from "react";
import {
  Stack,
  Typography,
  Checkbox,
  FormHelperText,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { selectWishlistItems } from "../../wishlist/WishlistSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { addToCartAsync, selectCartItems } from "../../cart/CartSlice";
import { useToast } from "../../../components/ToastProvider";

const placeholderImage = "/images/placeholder.jpg";

export const ProductCard = ({
  id,
  title,
  price,
  defaultImages = [],
  description,
  stockQuantity = 0,
  handleAddRemoveFromWishlist,
  isWishlistCard = false,
  isAdminCard = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const { showToast } = useToast();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isInWishlist = wishlistItems.some((item) => item?.product?._id === id);
  const isInCart = cartItems.some((item) => item?.product?._id === id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!loggedInUser) return navigate("/login");
    dispatch(addToCartAsync({ user: loggedInUser?._id, product: id }));
    showToast("Item added to cart successfully!", "success");
  };

  const mainImage = defaultImages.length > 0 ? defaultImages[0] : placeholderImage;
  const displayPrice = typeof price === "number" ? price.toFixed(2) : "0.00";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{ width: "100%", cursor: "pointer" }}
      onClick={() => navigate(`/product-details/${id}`)}
    >
      <Stack spacing={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <motion.img
          src={mainImage}
          alt={title}
          style={{
            width: "100%",
            height: isMobile ? "220px" : "300px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {title}
          </Typography>
          {!isAdminCard && (
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isInWishlist}
                onChange={(e) => handleAddRemoveFromWishlist(e, id)}
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: "red" }} />}
              />
            </motion.div>
          )}
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: ".9rem",
          }}
        >
          {description}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Typography fontWeight={600}>AED {displayPrice}</Typography>
          {!isWishlistCard && !isAdminCard && (
            <Button
              variant="contained"
              size="small"
              onClick={(e) => handleAddToCart(e)}
              disabled={isInCart}
              sx={{
                backgroundColor: isInCart ? "grey.300" : "black",
                color: isInCart ? "grey.600" : "white",
                textTransform: "none",
                borderRadius: "6px",
                fontSize: ".85rem",
                px: 2,
                "&:hover": {
                  backgroundColor: isInCart ? "grey.300" : "grey.900",
                },
              }}
            >
              {isInCart ? "In Cart" : "Add to Cart"}
            </Button>
          )}
        </Stack>

        {stockQuantity <= 20 && (
          <FormHelperText error sx={{ fontSize: ".85rem" }}>
            {stockQuantity === 1 ? "Only 1 left in stock" : "Limited stock available"}
          </FormHelperText>
        )}
      </Stack>
    </motion.div>
  );
};
