const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');

// /variants/product/:productId – Get all variants for a product
router.get('/product/:productId', variantController.getVariantsByProductId);

// /variants – Create a variant
router.post('/', variantController.createVariant);

// /variants/:id – Update a variant
router.put('/:id', variantController.updateVariant);

// /variants/:id – Delete a variant
router.delete('/:id', variantController.deleteVariant);

module.exports = router;
