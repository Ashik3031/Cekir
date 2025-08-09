const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  optionValues: {
    type: Object,
    required: true
  },
  sku: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  compareAtPrice: {
  type: Number,
  default: null,
},
  stock: { type: Number, required: true },
  images: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Variant || mongoose.model('Variant', variantSchema);
