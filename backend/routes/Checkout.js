const express = require("express");
const router = express.Router();
// const checkoutController = require("../controllers/Checkout.js");
const totalPayController = require("../controllers/TotalPayController.js");

// Use TotalPay controller instead of Stripe
router.post("/create-checkout-session", totalPayController.createCheckoutSession);
router.get('/verify-payment', totalPayController.verifyPaymentStatus);
router.post('/callback', express.json(), totalPayController.handleCallback); // TotalPay webhook endpoint

// router.get("/get-order", checkoutController.getOrderBySessionId); // If needed, implement in TotalPayController

module.exports = router;

