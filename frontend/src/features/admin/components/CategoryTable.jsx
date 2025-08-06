import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { axiosi } from "../../../config/axios";
import { useQuery } from "react-query";

const fetchCategories = async () => {
  const response = await axiosi.get("categories/");
  return response.data;
};

const CategoryTable = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useQuery("/categories", fetchCategories);
  if (isLoading) return <p>Loading....</p>;
  if (error) return <p>erorr.message</p>;

  return (
    <>
      <Box
        sx={{
          maxWidth: 800,
          margin: "50px auto",
          padding: 3,
          boxShadow: 3,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Category List
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">
                  <strong>Name</strong>
                </TableCell>
                <TableCell align="left">
                  <strong>Created Date</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        alert(`Edit category with id: ${category._id}`)
                      }
                    >
                   <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      //   onClick={() => handleDelete(category._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default CategoryTable;
