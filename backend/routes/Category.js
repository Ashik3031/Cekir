const express = require("express");
const categoryController = require("../controllers/Category");
const upload = require("../config/multer.config"); // ✅ This is what was missing

const router = express.Router();

router
  .get("/", categoryController.getAll)
  .post("/create", upload.single("image"),categoryController.createCategory)
  .post("/create-subcategory",upload.single("image"), categoryController.createSubCategory)
  .delete("/categories/:id", categoryController.deleteCategory)
  .delete("/subcategories/:id", categoryController.deleteSubCategory);

module.exports = router;
