const { Schema, default: mongoose } = require("mongoose");
const Product = require("../models/Product");
const Variant = require("../models/Variants");
const Category = require("../models/Category");
const slugify = require("slugify");
const SubCategory = require("../models/SubCategory");


exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      tags = [],
      options = [],
      variants = [],
      defaultImages = [],
      defaultPrice = 0,
      defaultStock = 0
    } = req.body;

    // ✅ Validate required fields
    if (!name || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Generate unique product slug
    const baseSlug = slugify(name, { lower: true });
    const finalSlug = `${baseSlug}-${Date.now()}`;

    // ✅ Create Product
    const product = await Product.create({
      name,
      slug: finalSlug,
      description,
      brand,
      category,
      tags,
      options,
      price: defaultPrice,   
      stock: defaultStock,   
      images: defaultImages.slice(0, 4)
    });

    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      createdVariants = await Promise.all(
        variants.map(async (v, i) => {
          const attrs = v.attributes || {};
          if (!attrs || Object.keys(attrs).length === 0) {
    return null; // ✅ Skip invalid variant
  }
          const valuesArr = Object.values(attrs);
          const values = valuesArr.join("-").toLowerCase();

          // ✅ Ensure unique slug & SKU
          const variantSlug = `${finalSlug}-${values || i}-${Date.now()}`;
          const sku = `${finalSlug.toUpperCase()}-${values.toUpperCase().replace(/\s+/g, "-")}-${Date.now()}`;

          // ✅ Validate price & stock
          const price = !isNaN(parseFloat(v.price)) ? parseFloat(v.price) : parseFloat(defaultPrice);
          const stock = !isNaN(parseInt(v.stock)) ? parseInt(v.stock) : parseInt(defaultStock);

          return Variant.create({
            product: product._id,
            optionValues: attrs,
            slug: variantSlug,
            sku,
            price,
            stock,
            images: Array.isArray(v.images) ? v.images.slice(0, 4) : []
          });
        })
      );
    }

    return res.status(201).json({ product, variants: createdVariants });
  } catch (error) {
    console.error("❌ Product creation error:", error);
    return res.status(500).json({
      message: "Product creation failed",
      error: error.message,
      code: error.code || null,
      stack: error.stack
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    const sort = {};
    let skip = 0;
    let limit = 0;

    // Ensure both category and subCategory are applied correctly
    if (req.query.category) {
      filter.category = req.query.category;

      if (req.query.subCategory) {
        filter.subcategory = req.query.subCategory;
      }
    }

    if (!req.query.category && req.query.subCategory) {
      return res
        .status(400)
        .json({ message: "Please provide a category with the subCategory" });
    }


// Search
    const isSearch = !!req.query.search || !!req.query.query;;
    if (isSearch) {
      const searchTerm = req.query.search || req.query.query;
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { title: searchRegex },
      ];
    }
    

    if (req.query.sort) {
      sort[req.query.sort] = req.query.order === "asc" ? 1 : -1;
    }
// Pagination only when not searching
    if (req.query.page && req.query.limit) {
  const pageSize = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  skip = pageSize * (page - 1);
  limit = pageSize;
}
    // if (req.query.page && req.query.limit) {
    //   const pageSize = parseInt(req.query.limit, 10) || 10;
    //   const page = parseInt(req.query.page, 10) || 1;
    //   skip = pageSize * (page - 1);
    //   limit = pageSize;
    // }

    // const totalDocs = await Product.countDocuments(filter);
//     const results = await Product.find(filter)
//       .sort(sort)
//       .skip(skip)
//       .limit(limit || 10);

//     res.set("X-Total-Count", totalDocs.toString());
//     res.status(200).json(results);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching products, please try again later" });
//   }
// };

const totalDocs = await Product.countDocuments(filter);
    const query = Product.find(filter).sort(sort);

    if (limit) {
  query.skip(skip).limit(limit);
}
    const results = await query.exec();

    res.set("X-Total-Count", totalDocs.toString());
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products, please try again later" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id)
      .populate("category", "name")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variants = await Variant.find({ product: id }).lean();

    return res.status(200).json({
      product,
      variants
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching product details",
      error: error.message
    });
  }
};



// exports.updateById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await Product.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.status(200).json(updated);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Error updating product, please try again later" });
//   }
// };

exports.updateById = async (req, res) => {
  try {
    const {
      _id,
      name,
      brand,
      price,
      stock,
      category,
      subCategory,
      description,
      isFeatured,
      isActive,
      tags,
      seo,
      defaultImages,
      variants,
    } = req.body;

    const product = await Product.findById(_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Update main fields
    product.name = name;
    product.slug = slugify(name);
    product.brand = brand;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.subCategory = subCategory;
    product.description = description;
    product.isFeatured = isFeatured;
    product.isActive = isActive;
    product.tags = JSON.parse(tags);
    product.seo = JSON.parse(seo);
    product.images = JSON.parse(defaultImages);

    await product.save();

    const variantArray = JSON.parse(variants);

    const existingVariants = await Variant.find({ product: _id });
    const updatedVariantIds = [];

    for (const v of variantArray) {
      if (v._id) {
        // Update existing variant
        const existing = await Variant.findById(v._id);
        if (existing) {
          existing.optionValues = v.optionValues;
          existing.price = v.price;
          existing.stock = v.stock;
          existing.images = v.images;
          existing.slug = slugify(`${product.name}-${v.optionValues?.Color || ''}-${v.optionValues?.Size || ''}`);
          existing.sku = `${product._id}-${v.optionValues?.Color || 'X'}-${v.optionValues?.Size || 'X'}`;
          await existing.save();
          updatedVariantIds.push(existing._id.toString());
        }
      } else {
        // Create new variant
        const newVariant = new Variant({
          product: product._id,
          optionValues: v.optionValues,
          price: v.price,
          stock: v.stock,
          images: v.images,
          slug: slugify(`${product.name}-${v.optionValues?.Color || ''}-${v.optionValues?.Size || ''}`),
          sku: `${product._id}-${v.optionValues?.Color || 'X'}-${v.optionValues?.Size || 'X'}`,
        });
        await newVariant.save();
        updatedVariantIds.push(newVariant._id.toString());
      }
    }

    // Remove deleted variants
    for (const ev of existingVariants) {
      if (!updatedVariantIds.includes(ev._id.toString())) {
        await Variant.findByIdAndDelete(ev._id);
      }
    }

    const updatedVariants = await Variant.find({ product: _id });
    res.status(200).json({ product, variants: updatedVariants });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// exports.updateById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const existingProduct = await Product.findById(id);
//     if (!existingProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const {
//       title,
//       description,
//       price,
//       discountPercentage,
//       category,
//       subCategory,
//     } = req.body;

//     const stockQuantity = req.body.stockQuantity
//       ? JSON.parse(req.body.stockQuantity)
//       : existingProduct.stockQuantity;

//     const stockQuantityMap = new Map(Object.entries(stockQuantity));

//     // Handle image updates
//     let thumbnail = existingProduct.thumbnail;
//     let images = existingProduct.images;

//     const thumbnailFile = req.files["thumbnail"]?.[0];
//     const imageFiles = req.files["images"] || [];

//     if (thumbnailFile) {
//       thumbnail = thumbnailFile.path;
//     }

//     if (imageFiles.length > 0) {
//       images = imageFiles.map((file) => file.path);
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       id,
//       {
//         title,
//         description,
//         price: parseFloat(price),
//         discountPercentage: parseFloat(discountPercentage),
//         category,
//         subcategory: subCategory,
//         stockQuantity: stockQuantityMap,
//         thumbnail,
//         images,
//       },
//       { new: true }
//     );

//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res
//       .status(500)
//       .json({ message: "Error updating product, please try again later" });
//   }
// };


exports.undeleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Product.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );
    res.status(200).json(restored);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error restoring product, please try again later" });
  }
};

exports.softdeleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json(deleted);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error hiding product" });
  }
};


exports.deleteById  = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete the product
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Delete associated variants
    await Variant.deleteMany({ product: id });

    res.status(200).json({
      message: "Product and its variants deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    
    console.error("Error deleting product:", error);
    res.status(500).json({ _id: id , message: "Server error", error: error.message });
  }
};


exports.getFeaturedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const featuredProducts = await Product.find({
      isFeatured: true,
      isDeleted: { $ne: true },
    })
      .skip(startIndex)
      .limit(limit);

    // getting the total count of featured products
    const totalCount = await Product.countDocuments({ isFeatured: true });

    res.status(200).json({
      data: featuredProducts,
      totalCount,
      currenPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching featured products, please try again later",
    });
  }
};

exports.getLatestProducts = async (req, res) => {
  const categoryName = req.params.category;
  console.log(categoryName, "categoryName");

  try {
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const categoryId = category._id;
    console.log(categoryId, "categoryId");

    const products = await Product.find({ category: categoryId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(products);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error Fetching Products, Please try again later" });
  }
};

exports.featuredProduct = async (req, res) => { 
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    const isFeatured = !product.isFeatured; // toggle the state
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error Fetching Product, Please try again later" });
  }
};

exports.getProductSuggestions = async (req, res) => {
  try {
    const { query } = req.params;
   
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }
    const suggestions = await Product.find({
      title: { $regex: query, $options: "i" },
    })
      .limit(5)
      .select("title description");

    res.json(suggestions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Fetching Suggestions, Please try again Later" });
  }
};


exports.searchProducts = async (req, res) =>{
  try {
    const query = req.query.q;
    console.log(query, "query");
    if(!query) return res.status(400).json({ message: "Query is required" });

    const products = await Product.find({
      title: { $regex: query, $options: "i" },
      isDeleted: false,
    });

    res.json(products);
  }catch(error){
    res.status(500).json({message:"Server error", error});
  }
}