const express = require("express");
const productController = require("../controllers/Product");
const router = express.Router();
// import upload from "../config/multer.config.js";
const upload = require("../config/multer.config.js");


router

  .post("/",productController.createProduct)


  .get("/", productController.getAll)


  .get("/featured", productController.getFeaturedProducts)
  .patch("/featured/:id", productController.featuredProduct)
  .get("/latest-products/:category", productController.getLatestProducts)
  .get("/suggestions/:query", productController.getProductSuggestions)
  .get("/search", productController.searchProducts)

  
  .get("/:id", productController.getById)

.patch(
  "/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  productController.updateById
)
// })
//   .patch(
//   "/:id",
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "images", maxCount: 4 },
//   ]),
//   productController.updateById
// )
  .patch("/undelete/:id", productController.undeleteById)
  .patch("/hide/:id", productController.softdeleteById)
  .patch("/unhide/:id", productController.undeleteById)
  .delete("/:id", productController.deleteById);

module.exports = router;
