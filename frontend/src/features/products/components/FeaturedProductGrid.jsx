import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeaturedProductsAsync,
  selectFeaturedProducts,
} from "../ProductSlice";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

const FeaturedProductGrid = () => {
  const dispatch = useDispatch();
  const featuredProducts = useSelector(selectFeaturedProducts);

  useEffect(() => {
    dispatch(fetchFeaturedProductsAsync());
  }, [dispatch]);

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <Typography textAlign="center" mt={5}>
        No featured products available.
      </Typography>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Related Products
      </Typography>
      <Grid container spacing={4}>
        {featuredProducts.slice(0, 8).map((product) => {
          const image =
          product.images?.[0] ||
            product?.defaultImages?.[0] ||
            "/placeholder.png";
          const price = product?.variants?.[0]?.price;

          return (
            <Grid item xs={12} sm={6} md={3} key={product._id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={image}
                  alt={product.name}
                  sx={{ objectFit: "cover", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.description?.slice(0, 60)}...
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {price ? `AED ${price.toFixed(2)}` : "Price N/A"}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 2, borderRadius: 2 }}
                    component={Link}
                    to={`/product-details/${product._id}`}
                  >
                    View Product
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FeaturedProductGrid;
