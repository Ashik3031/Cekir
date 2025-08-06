const Variant = require('../models/Variants');

// Get all variants for a product
exports.getVariantsByProductId = async (req, res) => {
  try {
    // ✅ Correct field name (product instead of productId)
    const variants = await Variant.find({ product: req.params.productId });
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Create a variant
exports.createVariant = async (req, res) => {
  try {
    const variant = new Variant(req.body);
    const savedVariant = await variant.save();
    res.status(201).json(savedVariant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a variant
exports.updateVariant = async (req, res) => {
  try {
    const updated = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a variant
exports.deleteVariant = async (req, res) => {
  try {
    await Variant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
