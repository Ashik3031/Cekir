// models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  optionValues: {
    type: Object,
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  address: {
    street: String,
    city: String,
    zip: String,
    country: String,
  },
  paymentMode: { type: String, enum: ["COD", "CARD"], required: true },
  total: { type: Number, required: true },
  orderNo: { type: Number, unique: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
