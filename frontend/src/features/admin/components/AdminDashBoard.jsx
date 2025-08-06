import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
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
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  InputAdornment,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AddIcon from "@mui/icons-material/Add";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SortIcon from "@mui/icons-material/Sort";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  fetchAllCategoriesAsync,
  selectCategories,
} from "../../categories/CategoriesSlice";
import { ProductCard } from "../../products/components/ProductCard";
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
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ITEMS_PER_PAGE } from "../../../constants";

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
  { key: "outOfStock", label: "Out of Stock", color: "warning" },
];

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

  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const categories = useSelector(selectCategories);
  const [sort, setSort] = useState(sortOptions[0]);
  const [page, setPage] = useState(1);
  const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is800 = useMediaQuery(theme.breakpoints.down(800));
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);
  const totalResults = useSelector(selectProductTotalResults);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const location = useLocation();

  // Get active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.subcategory.length > 0) count += filters.subcategory.length;
    if (filters.status !== "all") count += 1;
    if (localFilters.searchQuery) count += 1;
    return count;
  }, [filters, localFilters.searchQuery]);

  // Enhanced product filtering with frontend logic
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (localFilters.searchQuery) {
      const query = localFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query)
      );
    }

    // Status filters
    switch (filters.status) {
      case "active":
        filtered = filtered.filter(p => !p.isDeleted);
        break;
      case "hidden":
        filtered = filtered.filter(p => p.isDeleted);
        break;
      case "featured":
        filtered = filtered.filter(p => p.isFeatured);
        break;
      case "outOfStock":
        filtered = filtered.filter(p => (p.defaultStock || 0) === 0);
        break;
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.defaultPrice || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Stock range filter
    filtered = filtered.filter(product => {
      const stock = product.defaultStock || 0;
      return stock >= filters.stockRange[0] && stock <= filters.stockRange[1];
    });

    // Sort products
    if (sort) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (sort.sort) {
          case "name":
            aVal = a.name || "";
            bVal = b.name || "";
            break;
          case "price":
            aVal = a.defaultPrice || 0;
            bVal = b.defaultPrice || 0;
            break;
          case "stock":
            aVal = a.defaultStock || 0;
            bVal = b.defaultStock || 0;
            break;
          case "createdAt":
            aVal = new Date(a.createdAt || 0);
            bVal = new Date(b.createdAt || 0);
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

  // Pagination for filtered results
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const totalFilteredResults = filteredProducts.length;

  useEffect(() => {
    setPage(1);
  }, [localFilters.searchQuery, filters]);

  useEffect(() => {
    const finalFilters = { ...filters };
    finalFilters.pagination = { page: 1, limit: 1000 }; // Get all products for frontend filtering
    finalFilters.sort = null; // Handle sorting on frontend
    dispatch(fetchProductsAsync(finalFilters));
  }, [filters.category, filters.subcategory]);

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
    const isFeatured = product.isFeatured;
    dispatch(
      toggleProductFeaturedAsync({ id: productId, isFeatured: !isFeatured })
    );
  };

  const refreshData = () => {
    const finalFilters = { ...filters };
    finalFilters.pagination = { page: 1, limit: 1000 };
    dispatch(fetchProductsAsync(finalFilters));
  };

  const FilterPanel = () => (
    <Paper elevation={2} sx={{ height: "100%", width: is500 ? "100vw" : "320px" }}>
      <Stack p={3} spacing={3} sx={{ height: "100%", overflowY: "auto" }}>
        {/* Filter Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={clearAllFilters} title="Clear All">
              <RefreshIcon />
            </IconButton>
            <IconButton size="small" onClick={handleFilterToggle}>
              <ClearIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }} mb={1}>
              Active Filters ({activeFilterCount})
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {localFilters.searchQuery && (
                <Chip
                  label={`Search: ${localFilters.searchQuery}`}
                  size="small"
                  onDelete={() => setLocalFilters({...localFilters, searchQuery: ""})}
                />
              )}
              {filters.status !== "all" && (
                <Chip
                  label={statusFilters.find(s => s.key === filters.status)?.label}
                  size="small"
                  onDelete={() => handleStatusFilter("all")}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Status Filter */}
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
                size="small"
                onClick={() => handleStatusFilter(status.key)}
                sx={{ 
                  justifyContent: "flex-start",
                  ...(status.key === "all" && filters.status === "all" && {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark"
                    }
                  })
                }}
              >
                {status.label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Advanced Filters Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={showAdvancedFilters}
              onChange={(e) => setShowAdvancedFilters(e.target.checked)}
            />
          }
          label="Advanced Filters"
        />

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Stack spacing={3}>
                {/* Price Range */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                    Price Range (₹{filters.priceRange[0]} - ₹{filters.priceRange[1]})
                  </Typography>
                  <Slider
                    value={filters.priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                  />
                </Box>

                {/* Stock Range */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                    Stock Range ({filters.stockRange[0]} - {filters.stockRange[1]})
                  </Typography>
                  <Slider
                    value={filters.stockRange}
                    onChange={handleStockRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                  />
                </Box>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>

        <Divider />

        {/* Category Filters */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight="bold">
              Categories ({filters.category.length + filters.subcategory.length} selected)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Stack spacing={2} maxHeight="300px" sx={{ overflowY: "auto" }}>
              {categories?.map((category) => (
                <Box key={category._id}>
                  <FormGroup onChange={handleCategoryFilters}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.category.includes(category._id)}
                          value={category._id}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight="medium">
                          {category.name}
                        </Typography>
                      }
                    />
                  </FormGroup>

                  {/* Subcategories */}
                  {category.subCategory?.length > 0 && (
                    <FormGroup sx={{ ml: 3 }} onChange={handleSubcategoryFilters}>
                      {category.subCategory.map((subcat) => (
                        <FormControlLabel
                          key={subcat._id}
                          control={
                            <Checkbox
                              checked={filters.subcategory.includes(subcat._id)}
                              value={subcat._id}
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">{subcat.name}</Typography>}
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
    </Paper>
  );

  return (
    <>
      {/* Mobile Filter FAB */}
      <Badge badgeContent={activeFilterCount} color="error">
        <Fab
          color="primary"
          aria-label="filter"
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            zIndex: 999,
            display: { xs: "flex", md: "none" },
          }}
          onClick={handleFilterToggle}
        >
          <TuneIcon />
        </Fab>
      </Badge>

      {/* Filter Drawer */}
      <Drawer
        variant={is600 ? "temporary" : "persistent"}
        anchor="left"
        open={isProductFilterOpen}
        onClose={handleFilterToggle}
        sx={{
          width: isProductFilterOpen ? (is500 ? "100%" : "320px") : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: is500 ? "100%" : "320px",
            boxSizing: "border-box",
          },
        }}
      >
        <FilterPanel />
      </Drawer>

      {/* Main Content */}
      <Stack
        spacing={3}
        sx={{
          marginLeft: isProductFilterOpen && !is600 ? "320px" : 0,
          transition: "margin 0.3s ease",
          padding: { xs: "1rem", md: "2rem" },
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        {/* Header */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Top Row */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Typography variant="h4" fontWeight="bold" sx={{ color: "primary.main" }}>
                Products Dashboard
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Badge badgeContent={activeFilterCount} color="error">
                  <Button
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={handleFilterToggle}
                    sx={{ display: { xs: "none", md: "flex" } }}
                  >
                    Filters
                  </Button>
                </Badge>
                
                <Button
                  variant="contained"
                  component={Link}
                  to="/admin/add-product"
                  startIcon={<AddIcon />}
                >
                  Add Product
                </Button>
              </Stack>
            </Stack>

            {/* Search and Controls Row */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              {/* Search */}
              <TextField
                fullWidth
                placeholder="Search products by name..."
                value={localFilters.searchQuery}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, searchQuery: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: localFilters.searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setLocalFilters({ ...localFilters, searchQuery: "" })
                        }
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { md: "400px" } }}
              />

              {/* Sort */}
              <FormControl sx={{ minWidth: "200px" }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sort}
                  label="Sort By"
                  onChange={(e) => setSort(e.target.value)}
                  startAdornment={<SortIcon sx={{ mr: 1 }} />}
                >
                  {sortOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{option.icon}</span>
                        <span>{option.name}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
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
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Showing {paginatedProducts.length} of {totalFilteredResults} products
                {activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}
              </Typography>
              
              {activeFilterCount > 0 && (
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Products Grid/List */}
        <AnimatePresence mode="wait">
          {paginatedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "text.secondary" }} mb={2}>
                  No products found
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }} mb={3}>
                  Try adjusting your filters or search terms
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              </Paper>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Grid
                container
                spacing={viewMode === "grid" ? 3 : 2}
                sx={{ mb: 4 }}
              >
                {paginatedProducts.map((product, index) => (
                  <Grid
                    item
                    key={product._id}
                    xs={12}
                    sm={viewMode === "grid" ? 6 : 12}
                    md={viewMode === "grid" ? 4 : 12}
                    lg={viewMode === "grid" ? 3 : 12}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        elevation={2}
                        sx={{
                          height: "100%",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 4,
                          },
                        }}
                      >
                        <ProductCard
                          id={product._id}
                          title={product.name}
                          price={product.Price || 0}
                          defaultImages={product.images || []}
                          description={product.description || ""}
                          stockQuantity={product.defaultStock || 0}
                          isAdminCard={true}
                        />

                        <CardContent>
                          <Stack spacing={2}>
                            {/* Status Chips */}
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {product.isFeatured && (
                                <Chip
                                  label="Featured"
                                  color="primary"
                                  size="small"
                                />
                              )}
                              {product.isDeleted && (
                                <Chip
                                  label="Hidden"
                                  color="error"
                                  size="small"
                                />
                              )}
                              {(product.defaultStock || 0) === 0 && (
                                <Chip
                                  label="Out of Stock"
                                  color="warning"
                                  size="small"
                                />
                              )}
                              {!product.isDeleted && (product.defaultStock || 0) > 0 && (
                                <Chip
                                  label="Active"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </Stack>

                            {/* Action Buttons */}
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  component={Link}
                                  to={`/admin/product-update/${product._id}`}
                                  variant="contained"
                                  size="small"
                                  fullWidth
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() =>
                                    product.isDeleted
                                      ? handleProductUnDelete(product._id)
                                      : handleProductSoftDelete(product._id)
                                  }
                                  variant="outlined"
                                  color={product.isDeleted ? "success" : "error"}
                                  size="small"
                                  fullWidth
                                >
                                  {product.isDeleted ? "Show" : "Hide"}
                                </Button>
                              </Stack>

                              <Stack direction="row" spacing={1}>
                                <Button
                                  onClick={() => handleToggleFeatured(product._id)}
                                  variant="outlined"
                                  color={product.isFeatured ? "secondary" : "primary"}
                                  size="small"
                                  fullWidth
                                >
                                  {product.isFeatured ? "Unfeature" : "Feature"}
                                </Button>
                                <Button
                                  onClick={() => handleDeleteClick(product._id)}
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  fullWidth
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalFilteredResults > ITEMS_PER_PAGE && (
          <Stack spacing={2} alignItems="center">
            <Pagination
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              count={Math.ceil(totalFilteredResults / ITEMS_PER_PAGE)}
              variant="outlined"
              shape="rounded"
              size={is500 ? "small" : "medium"}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Page {page} of {Math.ceil(totalFilteredResults / ITEMS_PER_PAGE)}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={cancelDelete} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ color: "error.main" }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};