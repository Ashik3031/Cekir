import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Card,
  CardContent,
  CardMedia,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  InputAdornment,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Checkbox,
  Select,
  CardActionArea,
  Skeleton,
  Container,
  AppBar,
  Toolbar
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SortIcon from "@mui/icons-material/Sort";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  fetchAllCategoriesAsync,
  selectCategories,
} from "../../categories/CategoriesSlice";
import {
  deleteProductByIdAsync,
  fetchProductsAsync,
  selectProductIsFilterOpen,
  selectProductTotalResults,
  selectProducts,
  softDeleteProductByIdAsync,
  toggleFilters,
  toggleProductFeaturedAsync,
  undeleteProductByIdAsync,
} from "../../products/ProductSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ITEMS_PER_PAGE } from "../../../constants";

// --- constants ---
const sortOptions = [
  { name: "Name: A to Z", sort: "name", order: "asc", icon: "🔤" },
  { name: "Name: Z to A", sort: "name", order: "desc", icon: "🔤" },
  { name: "Price: Low to High", sort: "price", order: "asc", icon: "💰" },
  { name: "Price: High to Low", sort: "price", order: "desc", icon: "💰" },
  { name: "Stock: Low to High", sort: "stock", order: "asc", icon: "📦" },
  { name: "Stock: High to Low", sort: "stock", order: "desc", icon: "📦" },
  { name: "Recently Added", sort: "createdAt", order: "desc", icon: "🆕" },
  { name: "Oldest First", sort: "createdAt", order: "asc", icon: "📅" },
];

const statusFilters = [
  { key: "all", label: "All Products", color: "inherit" },
  { key: "active", label: "Active", color: "success" },
  { key: "hidden", label: "Hidden", color: "error" },
  { key: "featured", label: "Featured", color: "primary" },
];

// --- ENHANCED CARD COMPONENT: Fully Responsive ---
const CustomProductCard = ({
  product,
  onEdit,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
  viewMode = "grid",
  loading = false
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const defaultImage = product?.images?.[0] || "/placeholder-image.jpg";
  const stock = product?.defaultStock ?? product?.stock ?? 0;
  const price = product?.defaultPrice ?? product?.price ?? 0;

  const handleCardClick = () => {
    if (product?._id) {
      navigate(`/admin/product/${product._id}`);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: viewMode === 'grid' ? 400 : 200, borderRadius: 3 }}>
        <Skeleton variant="rectangular" height={viewMode === 'grid' ? 200 : 120} />
        <CardContent>
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={24} width="60%" />
          <Stack direction="row" spacing={1} mt={2}>
            <Skeleton variant="rectangular" height={32} width="48%" />
            <Skeleton variant="rectangular" height={32} width="48%" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <Card
        elevation={2}
        sx={{
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
          overflow: 'hidden'
        }}
      >
        <CardActionArea onClick={handleCardClick}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0}>
            <CardMedia
              component="img"
              sx={{
                width: { xs: '100%', sm: 200 },
                height: { xs: 200, sm: 140 },
                objectFit: 'cover'
              }}
              image={defaultImage}
              alt={product.name}
            />
            <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2} height="100%">
                <Box>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2
                    }}
                  >
                    {product.description}
                  </Typography>

                  <Typography
                    variant="h6"
                    color="primary.main"
                    fontWeight="bold"
                    gutterBottom
                  >
                    AED {price.toLocaleString()}
                  </Typography>

                  {/* Status Badges */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {product.isFeatured && (
                      <Chip 
                        icon={<StarIcon />}
                        label="Featured" 
                        color="primary" 
                        size="small" 
                        variant="filled"
                      />
                    )}
                    {product.isDeleted ? (
                      <Chip 
                        icon={<VisibilityOffIcon />}
                        label="Hidden" 
                        color="error" 
                        size="small" 
                        variant="filled"
                      />
                    ) : (
                      <Chip 
                        icon={<VisibilityIcon />}
                        label="Active" 
                        color="success" 
                        size="small" 
                        variant="filled"
                      />
                    )}
                    <Chip 
                      icon={<InventoryIcon />}
                      label={`Stock: ${stock}`}
                      color={stock > 0 ? "info" : "warning"}
                      size="small" 
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={1} 
                  mt="auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    component={Link}
                    to={`/admin/product-update/${product._id}`}
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(product._id);
                    }}
                    variant="outlined"
                    color={product.isDeleted ? "success" : "error"}
                    size="small"
                    startIcon={product.isDeleted ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    sx={{ flex: 1 }}
                  >
                    {product.isDeleted ? "Show" : "Hide"}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFeatured(product._id);
                    }}
                    variant="outlined"
                    color={product.isFeatured ? "secondary" : "primary"}
                    size="small"
                    startIcon={product.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                    sx={{ flex: 1 }}
                  >
                    {product.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(product._id);
                    }}
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Stack>
        </CardActionArea>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 8,
        },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <CardActionArea 
        onClick={handleCardClick}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <CardMedia
            component="img"
            height={isMobile ? 160 : 200}
            image={defaultImage}
            alt={product.name}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          {/* Status Badges Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {product.isFeatured && (
              <Chip
                icon={<StarIcon />}
                label="Featured"
                color="primary"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.9)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
            {product.isDeleted && (
              <Chip
                label="Hidden"
                color="error"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(211, 47, 47, 0.9)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          
          {/* Stock Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
            }}
          >
            <Chip
              label={stock > 0 ? `${stock} in stock` : 'Out of stock'}
              color={stock > 0 ? "success" : "error"}
              size="small"
              sx={{ 
                bgcolor: stock > 0 ? 'rgba(46, 125, 50, 0.9)' : 'rgba(211, 47, 47, 0.9)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="bold"
            sx={{
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
              minHeight: isMobile ? 40 : 48
            }}
          >
            {product.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
              flex: 1,
              minHeight: isMobile ? 45 : 60
            }}
          >
            {product.description}
          </Typography>

          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="primary.main"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            AED {price.toLocaleString()}
          </Typography>

          {/* Action Buttons */}
          <Stack 
            spacing={1} 
            onClick={(e) => e.stopPropagation()}
            sx={{ mt: 'auto' }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                component={Link}
                to={`/admin/product-update/${product._id}`}
                variant="contained"
                size="small"
                startIcon={<EditIcon />}
                fullWidth
                sx={{ 
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              >
                Edit
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(product._id);
                }}
                variant="outlined"
                color={product.isDeleted ? "success" : "error"}
                size="small"
                fullWidth
                startIcon={product.isDeleted ? <VisibilityIcon /> : <VisibilityOffIcon />}
                sx={{ borderRadius: 2 }}
              >
                {product.isDeleted ? "Show" : "Hide"}
              </Button>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(product._id);
                }}
                variant="outlined"
                color={product.isFeatured ? "secondary" : "primary"}
                size="small"
                fullWidth
                startIcon={product.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                sx={{ borderRadius: 2 }}
              >
                {product.isFeatured ? "Unfeature" : "Feature"}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product._id);
                }}
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                startIcon={<DeleteIcon />}
                sx={{ borderRadius: 2 }}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export const AdminDashBoard = () => {
  const [filters, setFilters] = useState({
    category: [],
    subcategory: [],
    status: "all",
    priceRange: [0, 10000],
    stockRange: [0, 1000],
  });
  const [localFilters, setLocalFilters] = useState({
    searchQuery: "",
    quickFilters: [],
  });

  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(false);
  const categories = useSelector(selectCategories);
  const [sort, setSort] = useState(sortOptions[0]);
  const [page, setPage] = useState(1);
  const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);
  const totalResults = useSelector(selectProductTotalResults);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.subcategory.length > 0) count += filters.subcategory.length;
    if (filters.status !== "all") count += 1;
    if (localFilters.searchQuery) count += 1;
    return count;
  }, [filters, localFilters.searchQuery]);

  // Filtering, Sorting & Pagination
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (localFilters.searchQuery) {
      const query = localFilters.searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    switch (filters.status) {
      case "active":
        filtered = filtered.filter((p) => !p.isDeleted);
        break;
      case "hidden":
        filtered = filtered.filter((p) => p.isDeleted);
        break;
      case "featured":
        filtered = filtered.filter((p) => p.isFeatured);
        break;
      case "outOfStock":
        filtered = filtered.filter((p) => (p.defaultStock || 0) === 0);
        break;
      default:
        break;
    }

    filtered = filtered.filter((product) => {
      const price = product.defaultPrice ?? 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    filtered = filtered.filter((product) => {
      const stock = product.defaultStock ?? 0;
      return stock >= filters.stockRange[0] && stock <= filters.stockRange[1];
    });

    if (filters.category.length > 0) {
      filtered = filtered.filter((product) =>
        filters.category.includes(product.category)
      );
    }
    if (filters.subcategory.length > 0) {
      filtered = filtered.filter((product) =>
        filters.subcategory.includes(product.subcategory)
      );
    }

    if (sort) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        switch (sort.sort) {
          case "name":
            aVal = a.name ?? "";
            bVal = b.name ?? "";
            break;
          case "price":
            aVal = a.defaultPrice ?? 0;
            bVal = b.defaultPrice ?? 0;
            break;
          case "stock":
            aVal = a.defaultStock ?? 0;
            bVal = b.defaultStock ?? 0;
            break;
          case "createdAt":
            aVal = new Date(a.createdAt ?? 0);
            bVal = new Date(b.createdAt ?? 0);
            break;
          default:
            return 0;
        }
        if (sort.order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [products, localFilters.searchQuery, filters, sort]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);
  const totalFilteredResults = filteredProducts.length;

  useEffect(() => {
    setPage(1);
  }, [localFilters.searchQuery, filters]);

  useEffect(() => {
    const finalFilters = { ...filters, pagination: { page: 1, limit: 1000 } };
    setIsLoading(true);
    dispatch(fetchProductsAsync(finalFilters)).finally(() => {
      setIsLoading(false);
    });
    dispatch(fetchAllCategoriesAsync());
  }, [filters.category, filters.subcategory, dispatch]);

  // Handlers
  const handleCategoryFilters = (e) => {
    const filterSet = new Set(filters.category);
    if (e.target.checked) {
      filterSet.add(e.target.value);
    } else {
      filterSet.delete(e.target.value);
    }
    setFilters({ ...filters, category: Array.from(filterSet) });
  };

  const handleSubcategoryFilters = (e) => {
    const filterSet = new Set(filters.subcategory);
    if (e.target.checked) {
      filterSet.add(e.target.value);
    } else {
      filterSet.delete(e.target.value);
    }
    setFilters({ ...filters, subcategory: Array.from(filterSet) });
  };

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status });
  };

  const handlePriceRangeChange = (event, newValue) => {
    setFilters({ ...filters, priceRange: newValue });
  };
  const handleStockRangeChange = (event, newValue) => {
    setFilters({ ...filters, stockRange: newValue });
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      subcategory: [],
      status: "all",
      priceRange: [0, 10000],
      stockRange: [0, 1000],
    });
    setLocalFilters({
      searchQuery: "",
      quickFilters: [],
    });
    setSort(sortOptions[0]);
    setPage(1);
  };

  const handleProductSoftDelete = (productId) => {
    dispatch(softDeleteProductByIdAsync(productId));
  };

  const handleProductUnDelete = (productId) => {
    dispatch(undeleteProductByIdAsync(productId));
  };

  const handleDeleteClick = (productId) => {
    setSelectedProductId(productId);
    setOpenDialog(true);
  };
  const confirmDelete = async () => {
    await dispatch(deleteProductByIdAsync(selectedProductId));
    setOpenDialog(false);
    setSelectedProductId(null);
  };
  const cancelDelete = () => {
    setOpenDialog(false);
    setSelectedProductId(null);
  };

  const handleFilterToggle = () => {
    dispatch(toggleFilters());
  };

  const handleToggleFeatured = (productId) => {
    const product = products.find((prod) => prod._id === productId);
    dispatch(
      toggleProductFeaturedAsync({
        id: productId,
        isFeatured: !product.isFeatured,
      })
    );
  };
  const handleToggleVisibility = (productId) => {
    const product = products.find((prod) => prod._id === productId);
    if (product.isDeleted) {
      handleProductUnDelete(productId);
    } else {
      handleProductSoftDelete(productId);
    }
  };

  // Enhanced Filter Panel
  const FilterPanel = () => (
    <Paper
      elevation={3}
      sx={{
        width: isXS ? "100vw" : 380,
        height: "100%",
        borderRadius: { xs: 0, sm: 3 },
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Filter Products
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton 
              size="small" 
              onClick={clearAllFilters} 
              title="Reset filters"
              sx={{ color: 'white' }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleFilterToggle}
              sx={{ color: 'white' }}
            >
              <ClearIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 3, height: 'calc(100% - 80px)', overflowY: 'auto' }}>
        <Stack spacing={3}>
          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Active Filters ({activeFilterCount})
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {localFilters.searchQuery && (
                  <Chip
                    label={`Search: ${localFilters.searchQuery}`}
                    size="small"
                    color="info"
                    onDelete={() => setLocalFilters((f) => ({ ...f, searchQuery: "" }))}
                    sx={{ borderRadius: 2 }}
                  />
                )}
                {filters.status !== "all" && (
                  <Chip
                    label={statusFilters.find((s) => s.key === filters.status)?.label}
                    size="small"
                    color="secondary"
                    onDelete={() => handleStatusFilter("all")}
                    sx={{ borderRadius: 2 }}
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Status Filters */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              Product Status
            </Typography>
            <Stack spacing={1}>
              {statusFilters.map((status) => (
                <Button
                  key={status.key}
                  variant={filters.status === status.key ? "contained" : "outlined"}
                  color={status.key === "all" ? "inherit" : status.color}
                  onClick={() => handleStatusFilter(status.key)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    fontWeight: filters.status === status.key ? "bold" : "normal",
                  }}
                >
                  {status.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Price Range */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              Price Range (AED)
            </Typography>
            <Slider
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
              marks={[
                { value: 0, label: '0' },
                { value: 5000, label: '5K' },
                { value: 10000, label: '10K' }
              ]}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption">
                AED {filters.priceRange[0].toLocaleString()}
              </Typography>
              <Typography variant="caption">
                AED {filters.priceRange[1].toLocaleString()}
              </Typography>
            </Stack>
          </Box>

          {/* Stock Range */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              Stock Range
            </Typography>
            <Slider
              value={filters.stockRange}
              onChange={handleStockRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
              marks={[
                { value: 0, label: '0' },
                { value: 500, label: '500' },
                { value: 1000, label: '1K' }
              ]}
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider />

          {/* Category Filters */}
          <Accordion defaultExpanded sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Categories & Subcategories
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
              <Stack spacing={2}>
                {categories?.map((category) => (
                  <Box key={category._id}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.category.includes(category._id)}
                            value={category._id}
                            onChange={handleCategoryFilters}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight="medium">
                            {category.name}
                          </Typography>
                        }
                      />
                    </FormGroup>
                    {category.subCategory && category.subCategory.length > 0 && (
                      <FormGroup sx={{ ml: 3, mt: 1 }}>
                        {category.subCategory.map((subcat) => (
                          <FormControlLabel
                            key={subcat._id}
                            control={
                              <Checkbox
                                checked={filters.subcategory.includes(subcat._id)}
                                value={subcat._id}
                                onChange={handleSubcategoryFilters}
                                size="small"
                                color="secondary"
                              />
                            }
                            label={
                              <Typography variant="body2" color="text.secondary">
                                {subcat.name}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    )}
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>
    </Paper>
  );

  // Render
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        position: "relative",
      }}
    >
      {/* Mobile Filter FAB */}
      {isMobile && (
        <Badge badgeContent={activeFilterCount} color="error">
          <Fab
            color="primary"
            aria-label="filter"
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1300,
              display: { xs: "flex", md: "none" },
              boxShadow: 6,
            }}
            onClick={handleFilterToggle}
          >
            <TuneIcon />
          </Fab>
        </Badge>
      )}

      {/* Filter Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={isProductFilterOpen}
        onClose={handleFilterToggle}
        sx={{
          width: isProductFilterOpen ? (isXS ? "100vw" : 380) : 0,
          flexShrink: 0,
          zIndex: 1201,
          "& .MuiDrawer-paper": {
            width: isXS ? "100vw" : 380,
            boxSizing: "border-box",
            border: 'none'
          },
        }}
      >
        <FilterPanel />
      </Drawer>

      {/* Main Content */}
      <Container
        maxWidth={false}
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          ml: isProductFilterOpen && !isMobile ? "380px" : 0,
          transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          maxWidth: "100% !important"
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}
            />
            
            <Stack spacing={3} position="relative">
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography
                    variant={isXS ? "h4" : "h3"}
                    fontWeight="bold"
                    sx={{ 
                      mb: 1,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    Products Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage your product inventory with ease
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Badge badgeContent={activeFilterCount} color="error">
                    <Button
                      variant="contained"
                      onClick={handleFilterToggle}
                      sx={{ 
                        display: { xs: "none", md: "inline-flex" },
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                      startIcon={<TuneIcon />}
                    >
                      Filters
                    </Button>
                  </Badge>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/admin/add-product"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'white'
                      }
                    }}
                    startIcon={<AddIcon />}
                  >
                    Add Product
                  </Button>
                </Stack>
              </Stack>

              {/* Search and Controls */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Stack spacing={3}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    {/* Search */}
                    <TextField
                      placeholder="Search products by name or description..."
                      value={localFilters.searchQuery}
                      onChange={(e) =>
                        setLocalFilters((f) => ({
                          ...f,
                          searchQuery: e.target.value,
                        }))
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: localFilters.searchQuery && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setLocalFilters((f) => ({ ...f, searchQuery: "" }))
                              }
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      sx={{
                        flex: 1,
                        maxWidth: { xs: "100%", sm: 400 },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                    
                    {/* Sort */}
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sort}
                        label="Sort By"
                        onChange={(e) => setSort(e.target.value)}
                        sx={{
                          borderRadius: 2,
                          bgcolor: 'white'
                        }}
                      >
                        {sortOptions.map((option, index) => (
                          <MenuItem key={option.name} value={option}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <span>{option.icon}</span>
                              <span>{option.name}</span>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* View Toggle */}
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          borderRadius: 2,
                          bgcolor: 'white',
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }
                      }}
                    >
                      <ToggleButton value="grid">
                        <ViewModuleIcon />
                      </ToggleButton>
                      <ToggleButton value="list">
                        <ViewListIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {/* Results Summary */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                    sx={{ color: 'text.primary' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <strong>{paginatedProducts.length}</strong> of{" "}
                      <strong>{totalFilteredResults}</strong> products
                      {activeFilterCount > 0 && (
                        <span> • {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}</span>
                      )}
                    </Typography>
                    {activeFilterCount > 0 && (
                      <Button
                        size="small"
                        color="secondary"
                        onClick={clearAllFilters}
                        startIcon={<ClearIcon />}
                        sx={{ 
                          fontWeight: 'bold',
                          borderRadius: 2
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Paper>

          {/* Products Grid/List */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Grid container spacing={3}>
                  {Array.from(new Array(8)).map((_, index) => (
                    <Grid
                      item
                      key={index}
                      xs={12}
                      sm={viewMode === "grid" ? 6 : 12}
                      md={viewMode === "grid" ? 4 : 12}
                      lg={viewMode === "grid" ? 3 : 12}
                    >
                      <CustomProductCard loading={true} viewMode={viewMode} />
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            ) : paginatedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Paper 
                  sx={{ 
                    p: { xs: 4, sm: 8 }, 
                    textAlign: "center",
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    gutterBottom
                    fontWeight="bold"
                  >
                    No products found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={4}>
                    {activeFilterCount > 0 
                      ? "Try adjusting your filters or search terms." 
                      : "Start by adding your first product to the inventory."
                    }
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    justifyContent="center"
                  >
                    {activeFilterCount > 0 ? (
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={clearAllFilters}
                        sx={{ borderRadius: 2 }}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        component={Link}
                        to="/admin/add-product"
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Add Your First Product
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </motion.div>
            ) : (
              <motion.div
                key={`${viewMode}-${page}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid
                  container
                  spacing={3}
                  sx={{
                    mb: 4,
                  }}
                >
                  {paginatedProducts.map((product, idx) => (
                    <Grid
                      item
                      key={product._id}
                      xs={12}
                      sm={viewMode === "grid" ? 6 : 12}
                      md={viewMode === "grid" ? 4 : 12}
                      lg={viewMode === "grid" ? 3 : 12}
                      xl={viewMode === "grid" ? 2.4 : 12}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                      >
                        <CustomProductCard
                          product={product}
                          onEdit={() => {}}
                          onToggleVisibility={handleToggleVisibility}
                          onToggleFeatured={handleToggleFeatured}
                          onDelete={handleDeleteClick}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalFilteredResults > ITEMS_PER_PAGE && (
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Pagination
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                count={Math.ceil(totalFilteredResults / ITEMS_PER_PAGE)}
                variant="outlined"
                shape="rounded"
                size={isXS ? "small" : "large"}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 'medium'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Page {page} of {Math.ceil(totalFilteredResults / ITEMS_PER_PAGE)} •{" "}
                Total: {totalFilteredResults} product{totalFilteredResults !== 1 ? 's' : ''}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={cancelDelete} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <DeleteIcon color="error" />
            <Typography variant="h6" fontWeight="bold" color="error.main">
              Confirm Deletion
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1">
            Are you sure you want to permanently delete this product? This action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={cancelDelete}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};