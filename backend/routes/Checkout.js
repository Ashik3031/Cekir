const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/Checkout.js");

const webhookMiddleware = express.raw({
  type: 'application/json'
});


  router.post("/create-checkout-session", checkoutController.createCheckoutSession)
  router.post('/webhook', webhookMiddleware, checkoutController.handleStripeWebhook);
  router.get('/verify-payment', checkoutController.verifyPaymentStatus);
  router.get("/get-order", checkoutController.getOrderBySessionId);


module.exports = router;
