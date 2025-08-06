const Order = require("../models/Order");
const PendingOrder = require('../models/PendingOrder');


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// exports.createCheckoutSession = async (req, res) => {
//   try {
//     const { products, order } = req.body;
//     // validating the request body
//     if (!products || !order) {
//       return res.status(400).json({ message: "Invalid request body" });
//     }

//     // creating the line items array
//     const lineItems = products.map((item) => ({
//       price_data: {
//         currency: "aed",
//         product_data: {
//           name: item.product.title,
//         },
//         unit_amount: Math.round(item.product.price * 100),
//       },
//       quantity: item.quantity,
//     }));

//     // creating the stripe checkout session

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       mode: "payment",
//       success_url: "https://barosatrendz.ae/order-success?session_id={CHECKOUT_SESSION_ID}",
//       cancel_url: "https://barosatrendz.ae/cart",
//       metadata: {
//         order_id: order._id,
//       },
//     });
    

//     // return the session ID to the front end
//     res.status(200).json({ id: session.id });
//   } catch (err) {
//     console.error("Error creating checkout session  ", err);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// };
exports.createCheckoutSession = async (req, res) => {
  try {
    const { products, orderData } = req.body;
    // validating the request body
    if (!products || !orderData) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Store order data temporarily (either in database as pending order or in session)
    // Instead of expecting an already created order, we'll store the order data
    
    // Option 1: Store in a temporary pending orders collection
    const pendingOrder = await PendingOrder.create({
      userData: orderData,
      products: products,
      created: new Date(),
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    });

    // creating the line items array
    const lineItems = products.map((item) => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: item.product.title,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    // creating the stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `https://barosatrendz.ae/payment-processing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://barosatrendz.ae/cart",
      metadata: {
        pending_order_id: pendingOrder._id.toString(), // Store reference to pending order
      },
    });

    // return the session ID to the front end
    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session  ", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};


exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Get the pending order ID from metadata
    const pendingOrderId = session.metadata.pending_order_id;
    
    // Find the pending order
    const pendingOrder = await PendingOrder.findById(pendingOrderId);
    
    if (!pendingOrder) {
      console.error('Pending order not found');
      return res.status(400).send('Pending order not found');
    }
    
    try {
      // Create the actual order now that payment is confirmed
      const order = await Order.create({
        user: pendingOrder.userData.user,
        items: pendingOrder.userData.items,
        address: pendingOrder.userData.address,
        paymentMode: 'CARD',
        total: pendingOrder.userData.total,
        paymentStatus: 'PAID',
        stripeSessionId: session.id
      });
      
      // Clean up the cart
      await Cart.deleteMany({ user: pendingOrder.userData.user });
      
      // Delete the pending order
      await PendingOrder.findByIdAndDelete(pendingOrderId);
      
      console.log(`Payment successful, order created: ${order._id}`);
    } catch (err) {
      console.error('Error creating order after payment', err);
    }
  }
  
  res.status(200).send({ received: true });
};


exports.verifyPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Find order using the session ID
      const order = await Order.findOne({ stripeSessionId: sessionId });
      
      if (order) {
        return res.status(200).json({ 
          success: true, 
          paid: true, 
          orderId: order._id 
        });
      } else {
        // Order might still be processing via webhook
        return res.status(202).json({ 
          success: true, 
          paid: true, 
          processing: true,
          message: 'Payment confirmed, order is being processed' 
        });
      }
    } else {
      return res.status(200).json({ 
        success: true, 
        paid: false,
        message: 'Payment not completed' 
      });
    }
  } catch (err) {
    console.error('Error verifying payment status', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying payment status' 
    });
  }
};

exports.getOrderBySessionId = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    //Retriving the stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || !session.metadata.order_id) {
      return res.status(400).json({ message: "Order not found" });
    }

    //fetch the order using order_id from metadata
    const order = await Order.findById(session.metadata.order_id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order by session ID", err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};
