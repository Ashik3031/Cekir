const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming this is the User model
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant', // ✅ this must match your Variant model name
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
