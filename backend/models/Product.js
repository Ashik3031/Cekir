const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true},
  description: String,
  brand: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  tags: [String],
  options: [String],
  images: [String],
  price: { type: Number, required: true },  
  stock: { type: Number, required: true },  
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
