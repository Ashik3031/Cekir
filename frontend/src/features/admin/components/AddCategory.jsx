import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import {
  addCategoriesAsync,
  addSubcategoryAsync,
  fetchAllCategoriesAsync,
  deleteCategoryAsync,
  deleteSubcategoryAsync,
  selectCategoryAddStatus,
  selectSubcategoryAddStatus,
  selectCategoryErrors,
  selectCategories,
  clearCategoryErrors,
  resetAddCategoryStatus,
  resetAddSubcategoryStatus,
} from "../../categories/CategoriesSlice";

const AddCategory = () => {
  const dispatch = useDispatch();

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const addStatus = useSelector(selectCategoryAddStatus);

  const [subName, setSubName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const addSubStatus = useSelector(selectSubcategoryAddStatus);

  const error = useSelector(selectCategoryErrors);
  const categories = useSelector(selectCategories);

  const [subImage, setSubImage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (addStatus === "fulfilled") {
      toast.success("Category added successfully");
      setCategoryName("");
      setCategoryImage(null);
      dispatch(resetAddCategoryStatus());
    } else if (addStatus === "rejected") {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to add category"
      );
      dispatch(resetAddCategoryStatus());
      dispatch(clearCategoryErrors());
    }
  }, [addStatus, error, dispatch]);

  useEffect(() => {
    if (addSubStatus === "fulfilled") {
      toast.success("Subcategory added successfully");
      setSubName("");
      setSelectedCategoryId("");
      dispatch(resetAddSubcategoryStatus());
    } else if (addSubStatus === "rejected") {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to add subcategory"
      );
      dispatch(resetAddSubcategoryStatus());
      dispatch(clearCategoryErrors());
    }
  }, [addSubStatus, error, dispatch]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName.trim());

    if (categoryImage) {
      formData.append("image", categoryImage);
    }

    dispatch(addCategoriesAsync(formData));
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!subName.trim() || !selectedCategoryId) {
      toast.error("Subcategory name and parent category are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", subName.trim());
    formData.append("category", selectedCategoryId);
    if (subImage) {
      formData.append("image", subImage); // optional image
    }

    dispatch(addSubcategoryAsync(formData));
  };

  const handleDeleteCategory = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category and its subcategories?"
      )
    ) {
      dispatch(deleteCategoryAsync(id));
    }
  };

  const handleDeleteSubcategory = (subcategoryId, categoryId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      dispatch(deleteSubcategoryAsync({ subcategoryId, categoryId }));
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "50px auto",
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Add Category
      </Typography>

      <form onSubmit={handleAddCategory} encType="multipart/form-data">
        <TextField
          label="Category Name"
          variant="outlined"
          fullWidth
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCategoryImage(e.target.files[0])}
          style={{ marginBottom: "16px" }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={addStatus === "pending"}
        >
          {addStatus === "pending" ? "Adding..." : "Add Category"}
        </Button>
      </form>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        Add Subcategory
      </Typography>

      <form onSubmit={handleAddSubcategory}>
        <TextField
          label="Subcategory Name"
          variant="outlined"
          fullWidth
          value={subName}
          onChange={(e) => setSubName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Category</InputLabel>
          <Select
            value={selectedCategoryId}
            label="Select Category"
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSubImage(e.target.files[0])}
            style={{ marginBottom: "16px" }}
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={addSubStatus === "pending"}
        >
          {addSubStatus === "pending" ? "Adding..." : "Add Subcategory"}
        </Button>
      </form>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Categories & Subcategories
      </Typography>

      {categories.map((cat) => (
        <Box
          key={cat._id}
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            mb: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1">{cat.name}</Typography>

              {/* ✅ Show image if available */}
              {cat.image && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              )}
            </Box>

            <IconButton
              color="error"
              onClick={() => handleDeleteCategory(cat._id)}
            >
              <Delete />
            </IconButton>
          </Box>

          {cat.subCategory?.length > 0 && (
            <Box sx={{ mt: 1, pl: 2 }}>
              {cat.subCategory.map((sub) => (
                <Box
                  key={sub._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography variant="body2">- {sub.name}</Typography>
                  {sub.image && (
                    <img
                      src={sub.image}
                      alt={sub.name}
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSubcategory(sub._id, cat._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default AddCategory;
