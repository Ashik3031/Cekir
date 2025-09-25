import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsByCategoryAsync,
  selectProductsByCategory,
  selectSelectedProduct,
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

const FeaturedProductGrid = ({ currentProductId }) => {
  const dispatch = useDispatch();
  const currentProduct = useSelector(selectSelectedProduct);
  const relatedProducts = useSelector(selectProductsByCategory);

  useEffect(() => {
    // Only fetch related products if we have a current product with category
    if (currentProduct?.category?._id) {
      dispatch(fetchProductsByCategoryAsync({
        categoryId: currentProduct.category._id,
        limit: 9, // Get 9 so we can exclude current product and show 8
        excludeProductId: currentProductId || currentProduct._id
      }));
    }
  }, [dispatch, currentProduct?.category?._id, currentProductId]);

  // Filter out the current product from related products
  const filteredProducts = relatedProducts?.filter(
    product => product._id !== (currentProductId || currentProduct?._id)
  ) || [];

  if (!currentProduct?.category) {
    return null; // Don't show anything if no category available
  }

  if (filteredProducts.length === 0) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Related Products from {currentProduct.category.name}
        </Typography>
        <Typography textAlign="center" color="text.secondary">
          No other products available in this category.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Related Products
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        More products from {currentProduct.category.name}
        {currentProduct.subcategory?.name && ` > ${currentProduct.subcategory.name}`}
      </Typography>
      
      <Grid container spacing={4}>
        {filteredProducts.slice(0, 8).map((product) => {
          // Enhanced image selection logic
          const image = 
            product.variants?.[0]?.images?.[0] || // First variant's first image
            product.images?.[0] || // Product's first image
            product.defaultImages?.[0] || // Default image
            "/placeholder.png";

          // Enhanced pricing logic
          const hasVariants = product.variants && product.variants.length > 0;
          let displayPrice, compareAtPrice, hasDiscount = false, discountPercentage = 0;

          if (hasVariants) {
            // Find the lowest priced variant
            const lowestPriceVariant = product.variants.reduce((lowest, variant) => 
              variant.price < lowest.price ? variant : lowest
            );
            displayPrice = lowestPriceVariant.price;
            compareAtPrice = lowestPriceVariant.compareAtPrice;
          } else {
            displayPrice = product.price;
            compareAtPrice = product.compareAtPrice;
          }

          // Calculate discount
          if (compareAtPrice && compareAtPrice > displayPrice) {
            hasDiscount = true;
            discountPercentage = Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100);
          }

          return (
            <Grid item xs={12} sm={6} md={3} key={product._id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "all 0.3s",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Discount Badge */}
                {hasDiscount && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "error.main",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      zIndex: 1,
                    }}
                  >
                    -{discountPercentage}%
                  </Box>
                )}

                {/* Stock Badge */}
                {((hasVariants && product.variants.every(v => v.stock === 0)) || 
                  (!hasVariants && product.stock === 0)) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "grey.600",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      zIndex: 1,
                    }}
                  >
                    Out of Stock
                  </Box>
                )}

                <CardMedia
                  component="img"
                  height="240"
                  image={image}
                  alt={product.name}
                  sx={{ 
                    objectFit: "cover", 
                    borderTopLeftRadius: 12, 
                    borderTopRightRadius: 12,
                    filter: ((hasVariants && product.variants.every(v => v.stock === 0)) || 
                            (!hasVariants && product.stock === 0)) ? "grayscale(50%)" : "none"
                  }}
                />
                
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ flexGrow: 1 }}>
                    {product.description?.slice(0, 60)}{product.description?.length > 60 ? "..." : ""}
                  </Typography>

                  {/* Brand */}
                  {product.brand && (
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {product.brand}
                    </Typography>
                  )}

                  {/* Price Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        AED {displayPrice?.toFixed(2)}
                      </Typography>
                      
                      {hasDiscount && (
                        <Typography 
                          variant="body2" 
                          sx={{ textDecoration: "line-through", color: "text.secondary" }}
                        >
                          AED {compareAtPrice?.toFixed(2)}
                        </Typography>
                      )}

                      {hasVariants && (
                        <Typography variant="caption" color="text.secondary">
                          from
                        </Typography>
                      )}
                    </Box>

                    {hasDiscount && (
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        Save AED {(compareAtPrice - displayPrice).toFixed(2)}
                      </Typography>
                    )}

                    {hasVariants && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {product.variants.length} variant{product.variants.length > 1 ? 's' : ''} available
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ 
                      mt: "auto",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                      }
                    }}
                    component={Link}
                    to={`/product-details/${product._id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredProducts.length > 8 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="outlined"
            component={Link}
            to={`/products?category=${currentProduct.category._id}`}
            sx={{ borderRadius: 2 }}
          >
            View All Products in {currentProduct.category.name}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FeaturedProductGrid;