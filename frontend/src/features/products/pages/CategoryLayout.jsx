import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosi } from "../../../config/axios";
import { Navbar } from "../../navigation/components/Navbar";

import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Skeleton,
  TextField,
  Drawer,
  Button,
  Chip,
  Stack,
  Paper,
  Divider,
  Slider,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Fab,
  Badge,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Collapse,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import StarIcon from "@mui/icons-material/Star";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  selectWishlistItems,
} from "../../wishlist/WishlistSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { motion, AnimatePresence } from "framer-motion";

const CategoryLayout = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("ALL");
  const [sort, setSort] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showQuickView, setShowQuickView] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    priceRange: [0, 50000],
    availability: "all", // all, inStock, outOfStock
    rating: 0,
    categories: [],
    subcategories: [],
    featured: false,
    freeShipping: false,
  });

  // UI states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector(selectWishlistItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const [searchParams] = useSearchParams();

  // FIX: sanitize wishlist items once
  const wishlistSafe = useMemo(
    () =>
      Array.isArray(wishlistItems)
        ? wishlistItems.filter((w) => w && w.product && w.product._id)
        : [],
    [wishlistItems]
  );

  const sortOptions = [
    { value: "featured", label: "Recommended" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Popular" },
  ];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosi.get("/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all products initially
  useEffect(() => {
    if (categories.length === 0) return;

    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
      const selected = categories.find((cat) => cat?._id === categoryId);
      if (selected) {
        setSelectedCategoryId(categoryId);
        setSelectedSubCategoryId("ALL");
        setSubCategories(selected.subCategory || []);
        fetchProductsByCategory(selected.name);
        return;
      }
    }

    setSelectedCategoryId("ALL");
    setSelectedSubCategoryId("ALL");
    setSubCategories([]);
    fetchAllProducts();
  }, [categories, searchParams]);

  const fetchAllProducts = async () => {
    setFetchStatus("pending");
    try {
      const res = await axiosi.get("/products");
      const data = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
      setProducts(data);
      setAllProducts(data);
      setFetchStatus("fulfilled");
    } catch (err) {
      console.error("Failed to fetch all products", err);
      setFetchStatus("error");
    }
  };

  const fetchProductsByCategory = async (categoryName) => {
    setFetchStatus("pending");
    try {
      const encoded = encodeURIComponent(categoryName ?? "");
      const res = await axiosi.get(`/products/latest-products/${encoded}`);
      const data = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
      setProducts(data);
      setAllProducts(data);
      setFetchStatus("fulfilled");
    } catch (err) {
      console.error("Error fetching category products", err);
      setFetchStatus("error");
    }
  };

  const fetchProductsBySubCategory = async (categoryName, subCategoryName) => {
    setFetchStatus("pending");
    try {
      const cat = encodeURIComponent(categoryName ?? "");
      const sub = encodeURIComponent(subCategoryName ?? "");
      const res = await axiosi.get(`/products/category/${cat}/subcategory/${sub}`);
      const data = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
      setProducts(data);
      setAllProducts(data);
      setFetchStatus("fulfilled");
    } catch (err) {
      console.error("Error fetching subcategory products", err);
      setFetchStatus("error");
    }
  };

  // Advanced filtering logic
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];

    let result = allProducts.filter(Boolean); // FIX: drop nulls early

    // Step 1: Text search
    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      result = result.filter((product) =>
        (product?.name || "").toLowerCase().includes(query) ||
        (product?.title || "").toLowerCase().includes(query)
      );
    }

    // Step 2: Price filter
    const [minPrice, maxPrice] = filters.priceRange;
    result = result.filter((product) => {
      const price = product?.price ?? product?.defaultPrice ?? 0;
      return price >= minPrice && price <= maxPrice;
    });

    // Step 3: Stock filter
    if (filters.availability === "inStock") {
      result = result.filter(
        (product) => (product?.stock ?? product?.defaultStock ?? 0) > 0
      );
    } else if (filters.availability === "outOfStock") {
      result = result.filter(
        (product) => (product?.stock ?? product?.defaultStock ?? 0) === 0
      );
    }

    // Step 4: Rating filter
    if (filters.rating > 0) {
      result = result.filter((product) => (product?.rating ?? 0) >= filters.rating);
    }

    // Step 5: Feature filters
    if (filters.featured) {
      result = result.filter((product) => product?.isFeatured === true);
    }
    if (filters.freeShipping) {
      result = result.filter((product) => product?.freeShipping === true);
    }

    // Step 6: Sort
    result.sort((a, b) => {
      const priceA = a?.price ?? a?.defaultPrice ?? 0;
      const priceB = b?.price ?? b?.defaultPrice ?? 0;
      const dateA = new Date(a?.createdAt ?? 0);
      const dateB = new Date(b?.createdAt ?? 0);
      const ratingA = a?.rating ?? 0;
      const ratingB = b?.rating ?? 0;
      const salesA = a?.sales ?? 0;
      const salesB = b?.sales ?? 0;

      switch (sort) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "newest":
          return dateB - dateA;
        case "name_asc":
          return (a?.name || "").localeCompare(b?.name || "");
        case "name_desc":
          return (b?.name || "").localeCompare(a?.name || "");
        case "rating":
          return ratingB - ratingA;
        case "popular":
          return salesB - salesA;
        default:
          return (b?.isFeatured ? 1 : 0) - (a?.isFeatured ? 1 : 0);
      }
    });

    return result;
  }, [allProducts, filters, sort]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  const handleCategoryChange = (categoryId, categoryName) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId("ALL");
    setFilters({ ...filters, categories: [], subcategories: [] });
    setCurrentPage(1);

    if (categoryId === "ALL") {
      setSubCategories([]);
      fetchAllProducts();
    } else {
      const selected = categories.find((cat) => cat?._id === categoryId);
      setSubCategories(selected?.subCategory || []);
      fetchProductsByCategory(categoryName);
    }

    if (categoryId === "ALL") {
      navigate(`/categories`);
    } else {
      navigate(`/categories?categoryId=${categoryId}`);
    }
  };

  const handleSubCategoryChange = (subCategoryId, subCategoryName) => {
    setSelectedSubCategoryId(subCategoryId);
    setCurrentPage(1);
    const selected = categories.find((cat) => cat?._id === selectedCategoryId);
    if (subCategoryId === "ALL") {
      fetchProductsByCategory(selected?.name);
    } else {
      fetchProductsBySubCategory(selected?.name, subCategoryName);
    }
  };

  // FIX: null-safe wishlist handler
  const handleAddRemoveFromWishlist = (e, productId) => {
    e.stopPropagation();
    if (!productId) return;

    const isWishlisted = wishlistSafe.some((item) => item?.product?._id === productId);

    if (!isWishlisted) {
      if (!loggedInUser) {
        navigate("/login");
      } else {
        dispatch(
          createWishlistItemAsync({ user: loggedInUser?._id, product: productId })
        );
      }
    } else {
      const item = wishlistSafe.find((item) => item?.product?._id === productId);
      if (item?._id) dispatch(deleteWishlistItemByIdAsync(item._id));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      priceRange: [0, 50000],
      availability: "all",
      rating: 0,
      categories: [],
      subcategories: [],
      featured: false,
      freeShipping: false,
    });
    setSort("featured");
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    if (filters.availability !== "all") count++;
    if (filters.rating > 0) count++;
    if (filters.featured) count++;
    if (filters.freeShipping) count++;
    return count;
  }, [filters]);

  const FilterSidebar = () => (
    <Box
      sx={{
        width: isMobile ? "100vw" : "280px",
        height: "100vh",
        bgcolor: "white",
        borderRight: "1px solid #e5e5e5",
        overflow: "auto",
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Filter Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 400, fontSize: "16px" }}>
            Filter & Sort
          </Typography>
          <IconButton size="small" onClick={() => setIsFilterOpen(false)} sx={{ display: { md: "none" } }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Search */}
        <Box mb={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "#666" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                border: "none",
                borderBottom: "1px solid #e5e5e5",
                "&:hover": {
                  borderBottom: "1px solid #000",
                },
                "&.Mui-focused": {
                  borderBottom: "2px solid #000",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
          />
        </Box>

        {/* Sort */}
        <Box mb={4}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 400, fontSize: "14px" }}>
            Sort by
          </Typography>
          <RadioGroup value={sort} onChange={(e) => setSort(e.target.value)}>
            {sortOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" sx={{ color: "#666" }} />}
                label={<Typography sx={{ fontSize: "14px" }}>{option.label}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 3, bgcolor: "#e5e5e5" }} />

        {/* Price Range */}
        <Box mb={4}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 400, fontSize: "14px" }}>
            Price
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontSize: "12px", color: "#666" }}>
            ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
          </Typography>
          <Slider
            value={filters.priceRange}
            onChange={(e, newValue) => setFilters({ ...filters, priceRange: newValue })}
            min={0}
            max={50000}
            step={500}
            sx={{
              color: "#000",
              "& .MuiSlider-thumb": {
                bgcolor: "#000",
                "&:hover": {
                  boxShadow: "0px 0px 0px 8px rgba(0, 0, 0, 0.16)",
                },
              },
              "& .MuiSlider-track": {
                bgcolor: "#000",
              },
              "& .MuiSlider-rail": {
                bgcolor: "#e5e5e5",
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3, bgcolor: "#e5e5e5" }} />

        {/* Features */}
        <Box mb={4}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 400, fontSize: "14px" }}>
            Features
          </Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                  size="small"
                  sx={{ color: "#666" }}
                />
              }
              label={<Typography sx={{ fontSize: "14px" }}>Featured</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.freeShipping}
                  onChange={(e) => setFilters({ ...filters, freeShipping: e.target.checked })}
                  size="small"
                  sx={{ color: "#666" }}
                />
              }
              label={<Typography sx={{ fontSize: "14px" }}>Free shipping</Typography>}
            />
          </Stack>
        </Box>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            fullWidth
            variant="outlined"
            onClick={clearAllFilters}
            sx={{
              mt: 3,
              color: "#000",
              borderColor: "#000",
              borderRadius: 0,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#000",
                color: "white",
              },
            }}
          >
            Clear all ({activeFilterCount})
          </Button>
        )}
      </Box>
    </Box>
  );

  const ProductCard = ({ product, index }) => {
  // compute first, no hooks
  const productId = product?._id;
  const isWishlisted = wishlistSafe.some(
    (item) => item?.product?._id && productId && item.product._id === productId
  );

  // safe early return AFTER any hooks (we don't have hooks here now)
  if (!product) return null;

  const price = product?.price || product?.defaultPrice || 0;
  const stock = product?.stock || product?.defaultStock || 0;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
        <Box
          sx={{
            cursor: "pointer",
            "&:hover .product-overlay": {
              opacity: 1,
            },
          }}
          onClick={() => product?._id && navigate(`/product-details/${product._id}`)} // FIX
        >
          {/* Product Image */}
          <Box sx={{ position: "relative", mb: 2, bgcolor: "#f5f5f5" }}>
            <CardMedia
              component="img"
              height="400"
              image={product?.images?.[0] || "/placeholder.jpg"}
              alt={product?.title || product?.name || "Product"}
              sx={{
                objectFit: "cover",
                aspectRatio: "3/4",
              }}
            />

            {/* Wishlist Button */}
            <IconButton
              className="product-overlay"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: "white",
                opacity: 0,
                transition: "opacity 0.3s ease",
                "&:hover": {
                  bgcolor: "white",
                },
              }}
              onClick={(e) => handleAddRemoveFromWishlist(e, product?._id)} // FIX
              disabled={!product?._id} // FIX
            >
              {isWishlisted ? (
                <FavoriteIcon sx={{ color: "#e91e63", fontSize: 20 }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: "#000", fontSize: 20 }} />
              )}
            </IconButton>

            {/* Stock Badge */}
            {stock === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  bgcolor: "white",
                  px: 1,
                  py: 0.5,
                }}
              >
                <Typography sx={{ fontSize: "11px", fontWeight: 500 }}>Out of stock</Typography>
              </Box>
            )}
          </Box>

          {/* Product Info */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                lineHeight: 1.4,
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "#000",
              }}
            >
              {product?.title || product?.name || "Untitled Product"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: "12px",
                color: "#666",
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product?.description || ""}
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 500, color: "#000", fontSize: "14px" }}>
              ₹{price.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />

      {/* Filter Drawer */}
      <Drawer
        anchor="left"
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          width: isFilterOpen ? (isMobile ? "100%" : "280px") : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? "100%" : "280px",
            boxSizing: "border-box",
            top: "80px",
            height: "calc(100vh - 80px)",
            border: "none",
          },
        }}
      >
        <FilterSidebar />
      </Drawer>

      {/* Filter FAB for Mobile */}
      <Fab
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: { xs: "flex", md: "none" },
          bgcolor: "#000",
          color: "white",
          "&:hover": {
            bgcolor: "#333",
          },
        }}
        onClick={() => setIsFilterOpen(true)}
      >
        <TuneIcon />
      </Fab>

      {/* Main Content */}
      <Box
        sx={{
          pt: "80px",
          minHeight: "100vh",
          bgcolor: "white",
          marginLeft: isFilterOpen && !isMobile ? "280px" : 0,
          transition: "margin 0.3s ease",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 300, mb: 2, fontSize: { xs: "24px", md: "32px" } }}>
              {selectedCategoryId === "ALL"
                ? "All Products"
                : categories.find((cat) => cat?._id === selectedCategoryId)?.name || "Products"}
            </Typography>

            {/* Category Pills */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Chip
                label="All"
                variant={selectedCategoryId === "ALL" ? "filled" : "outlined"}
                onClick={() => handleCategoryChange("ALL", "ALL")}
                sx={{
                  borderRadius: 16,
                  bgcolor: selectedCategoryId === "ALL" ? "#000" : "transparent",
                  color: selectedCategoryId === "ALL" ? "white" : "#000",
                  borderColor: "#e5e5e5",
                  fontSize: "12px",
                  "&:hover": {
                    bgcolor: selectedCategoryId === "ALL" ? "#333" : "#f5f5f5",
                  },
                }}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat?._id || cat?.name}
                  label={cat?.name}
                  variant={selectedCategoryId === cat?._id ? "filled" : "outlined"}
                  onClick={() => handleCategoryChange(cat?._id, cat?.name)}
                  sx={{
                    borderRadius: 16,
                    bgcolor: selectedCategoryId === cat?._id ? "#000" : "transparent",
                    color: selectedCategoryId === cat?._id ? "white" : "#000",
                    borderColor: "#e5e5e5",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: selectedCategoryId === cat?._id ? "#333" : "#f5f5f5",
                    },
                  }}
                />
              ))}
            </Stack>

            {/* Subcategories */}
            {selectedCategoryId !== "ALL" && subCategories.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mt: 2,
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                <Chip
                  label="All"
                  variant={selectedSubCategoryId === "ALL" ? "filled" : "outlined"}
                  onClick={() => handleSubCategoryChange("ALL", "ALL")}
                  size="small"
                  sx={{
                    bgcolor: selectedSubCategoryId === "ALL" ? "#000" : "transparent",
                    color: selectedSubCategoryId === "ALL" ? "white" : "#666",
                    borderColor: "#e5e5e5",
                    fontSize: "11px",
                  }}
                />
                {subCategories.map((sub) => (
                  <Chip
                    key={sub?._id || sub?.name}
                    label={sub?.name}
                    variant={selectedSubCategoryId === sub?._id ? "filled" : "outlined"}
                    onClick={() => handleSubCategoryChange(sub?._id, sub?.name)}
                    size="small"
                    sx={{
                      bgcolor: selectedSubCategoryId === sub?._id ? "#000" : "transparent",
                      color: selectedSubCategoryId === sub?._id ? "white" : "#666",
                      borderColor: "#e5e5e5",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Controls Bar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4, py: 2, borderBottom: "1px solid #e5e5e5" }}
          >
            <Typography variant="body2" sx={{ color: "#666", fontSize: "14px" }}>
              {filteredProducts.length} items
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                startIcon={<TuneIcon />}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                sx={{
                  display: { xs: "none", md: "flex" },
                  color: "#000",
                  textTransform: "none",
                  fontSize: "14px",
                }}
              >
                Filter & Sort
              </Button>
            </Stack>
          </Stack>

          {/* Products Grid */}
          {fetchStatus === "pending" ? (
            <Grid container spacing={2}>
              {[...Array(12)].map((_, idx) => (
                <Grid item xs={6} sm={4} md={viewMode === "list" ? 12 : 3} lg={viewMode === "list" ? 12 : 3} key={idx}>
                  <Box>
                    <Skeleton variant="rectangular" height={400} sx={{ bgcolor: "#f5f5f5" }} />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="text" sx={{ fontSize: "14px", mb: 0.5 }} />
                      <Skeleton variant="text" sx={{ fontSize: "12px", mb: 1, width: "80%" }} />
                      <Skeleton variant="text" sx={{ fontSize: "14px", width: "40%" }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : fetchStatus === "error" ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#666" }}>Something went wrong</Typography>
              <Button
                variant="outlined"
                onClick={fetchAllProducts}
                sx={{
                  color: "#000",
                  borderColor: "#000",
                  borderRadius: 0,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#000",
                    color: "white",
                  },
                }}
              >
                Try again
              </Button>
            </Box>
          ) : filteredProducts.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Grid container spacing={2}>
                    {paginatedProducts
                      .filter(Boolean) // FIX: skip nulls
                      .map((product, index) => (
                        <Grid
                          item
                          xs={6}
                          sm={4}
                          md={viewMode === "list" ? 12 : 3}
                          lg={viewMode === "list" ? 12 : 3}
                          key={product?._id || `p-${index}`} // FIX
                        >
                          <ProductCard product={product} index={index} />
                        </Grid>
                      ))}
                  </Grid>
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                  <Stack spacing={3} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        variant="outlined"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        sx={{
                          color: "#000",
                          borderColor: "#e5e5e5",
                          borderRadius: 0,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#000",
                          },
                          "&:disabled": {
                            color: "#ccc",
                            borderColor: "#e5e5e5",
                          },
                        }}
                      >
                        Previous
                      </Button>

                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNumber =
                          currentPage <= 3
                            ? index + 1
                            : currentPage >= totalPages - 2
                            ? totalPages - 4 + index
                            : currentPage - 2 + index;

                        if (pageNumber > totalPages || pageNumber < 1) return null;

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "contained" : "outlined"}
                            onClick={() => setCurrentPage(pageNumber)}
                            sx={{
                              minWidth: 40,
                              bgcolor: currentPage === pageNumber ? "#000" : "transparent",
                              color: currentPage === pageNumber ? "white" : "#000",
                              borderColor: "#e5e5e5",
                              borderRadius: 0,
                              "&:hover": {
                                bgcolor: currentPage === pageNumber ? "#333" : "#f5f5f5",
                                borderColor: "#000",
                              },
                            }}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}

                      <Button
                        variant="outlined"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        sx={{
                          color: "#000",
                          borderColor: "#e5e5e5",
                          borderRadius: 0,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#000",
                          },
                          "&:disabled": {
                            color: "#ccc",
                            borderColor: "#e5e5e5",
                          },
                        }}
                      >
                        Next
                      </Button>
                    </Stack>

                    <Typography variant="body2" sx={{ color: "#666", fontSize: "12px" }}>
                      Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#666", fontWeight: 300 }}>No products found</Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "#999" }}>Try adjusting your search or filters</Typography>
              {activeFilterCount > 0 && (
                <Button
                  variant="outlined"
                  onClick={clearAllFilters}
                  sx={{
                    color: "#000",
                    borderColor: "#000",
                    borderRadius: 0,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#000",
                      color: "white",
                    },
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </Box>
          )}
        </Container>

        {/* Quick View Dialog */}
        <Dialog
          open={!!showQuickView}
          onClose={() => setShowQuickView(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              bgcolor: "white",
            },
          }}
        >
          {showQuickView && (
            <DialogContent sx={{ p: 0 }}>
              <Stack direction={{ xs: "column", md: "row" }}>
                {/* Product Image */}
                <Box sx={{ flex: 1, position: "relative", bgcolor: "#f5f5f5" }}>
                  <img
                    src={showQuickView?.images?.[0] || "/placeholder.jpg"}
                    alt={showQuickView?.title || showQuickView?.name || "Product"}
                    style={{
                      width: "100%",
                      height: "500px",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      bgcolor: "white",
                    }}
                    onClick={() => setShowQuickView(null)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Product Details */}
                <Box sx={{ flex: 1, p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 300, mb: 2 }}>
                    {showQuickView?.title || showQuickView?.name}
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>
                    ₹{(showQuickView?.price || showQuickView?.defaultPrice || 0).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#666", mb: 4, lineHeight: 1.6 }}>
                    {showQuickView?.description || "No description available"}
                  </Typography>

                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => {
                        setShowQuickView(null);
                        if (showQuickView?._id) navigate(`/product-details/${showQuickView._id}`); // FIX
                      }}
                      sx={{
                        bgcolor: "#000",
                        color: "white",
                        borderRadius: 0,
                        textTransform: "none",
                        py: 1.5,
                        "&:hover": {
                          bgcolor: "#333",
                        },
                      }}
                    >
                      View details
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={
                        wishlistSafe.some((item) => item?.product?._id === showQuickView?._id) ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )
                      } // FIX
                      onClick={(e) => handleAddRemoveFromWishlist(e, showQuickView?._id)} // FIX
                      disabled={!showQuickView?._id} // FIX
                      sx={{
                        color: "#000",
                        borderColor: "#000",
                        borderRadius: 0,
                        textTransform: "none",
                        py: 1.5,
                        "&:hover": {
                          bgcolor: "#f5f5f5",
                        },
                      }}
                    >
                      {wishlistSafe.some((item) => item?.product?._id === showQuickView?._id)
                        ? "Remove from favorites"
                        : "Add to favorites"}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </>
  );
};

export default CategoryLayout;
