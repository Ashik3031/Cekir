const mongoose = require('mongoose');

const pendingOrderSchema = new mongoose.Schema({
  userData: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  expires: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - document will be deleted automatically when it expires
  }
});

module.exports = mongoose.model('PendingOrder', pendingOrderSchema);