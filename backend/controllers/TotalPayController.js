const axios = require('axios');
const CryptoJS = require('crypto-js');
const totalPayConfig = require('../config/totalpay');
const PendingOrder = require('../models/PendingOrder');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Helper for hashing
const generateHash = (string) => {
    return CryptoJS.SHA1(CryptoJS.MD5(string.toUpperCase()).toString()).toString(CryptoJS.enc.Hex);
};


exports.createCheckoutSession = async (req, res) => {
    try {
        const { products, orderData } = req.body;

        if (!products || !orderData) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        // Store order data temporarily
        const pendingOrder = await PendingOrder.create({
            userData: orderData,
            products: products,
            created: new Date(),
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
        });

        const orderId = pendingOrder._id.toString();

        // Validate and format amount
        const numericTotal = Number(orderData.total);
        if (Number.isNaN(numericTotal)) {
            console.error('Invalid order total:', orderData.total);
            return res.status(400).json({ message: 'Invalid order total' });
        }
        const amount = numericTotal.toFixed(2); // Ensure 2 decimal places

        const currency = "AED"; // Adjust if you support other currencies
        const description = "Order #" + orderId;

        // Signature Generation (as per TotalPay docs)
        const toMd5 = orderId + amount + currency + description + totalPayConfig.merchantPass;
        const sha1Hash = generateHash(toMd5);

        const payloadBase = {
            merchant_key: totalPayConfig.merchantId,
            operation: 'purchase',
            // Nested order object (supported by some integrations)
            order: {
                number: orderId,
                amount: amount,
                currency: currency,
                description: description
            },
            // Flat keys (some integrations expect these top-level keys)
            order_number: orderId,
            order_amount: amount,
            order_currency: currency,
            order_description: description,

            cancel_url: "https://cekirbazaar.com/cart",
            success_url: `https://cekirbazaar.com/payment-processing?session_id=${orderId}`,
            hash: sha1Hash,
            customer: {
                name: orderData.userName || orderData.user || "Customer",
                email: orderData.userEmail || orderData.email || "customer@example.com"
            }
        };

        // Attach methods only when explicitly configured (some MIDs may not accept a methods filter)
        const methodsEnv = process.env.TOTALPAY_METHODS; // e.g. 'card,paypal'
        const payload = { ...payloadBase };
        if (methodsEnv) {
            payload.methods = methodsEnv.split(',').map(m => m.trim());
        }

        // Debug logs only in non-production / test mode
        if (process.env.TOTALPAY_MODE === 'test' || process.env.NODE_ENV !== 'production') {
            console.log('TotalPay create session (debug):', {
                orderId,
                amount,
                currency,
                description,
                merchant_key: totalPayConfig.merchantId,
                methods: payload.methods || null,
                hash: sha1Hash
            });
        }

        // Call TotalPay API
        let response;
        try {
            response = await axios.post(totalPayConfig.baseUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
        } catch (apiErr) {
            // If TotalPay complains about unacceptable methods, retry without methods
            const apiErrData = apiErr.response ? apiErr.response.data : null;
            console.error('TotalPay API call failed', apiErr.response ? {
                status: apiErr.response.status,
                data: apiErr.response.data
            } : apiErr.message);

            if (apiErrData && typeof apiErrData.error_message === 'string' && apiErrData.error_message.toLowerCase().includes('not found acceptable methods')) {
                if (payload.methods) {
                    console.warn('TotalPay rejected provided methods; retrying without methods filter');
                    try {
                        const retryResp = await axios.post(totalPayConfig.baseUrl, payloadBase, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 10000
                        });

                        if (retryResp.data && retryResp.data.redirect_url) {
                            return res.status(200).json({ redirect_url: retryResp.data.redirect_url, payment_id: retryResp.data.payment_id });
                        }

                        console.error('TotalPay retry returned unexpected response:', retryResp.data);
                        return res.status(502).json({ error: 'TotalPay API error on retry', details: retryResp.data });
                    } catch (retryErr) {
                        console.error('TotalPay retry failed', retryErr.response ? {
                            status: retryErr.response.status,
                            data: retryErr.response.data
                        } : retryErr.message);
                        return res.status(502).json({ error: 'TotalPay API retry error', details: retryErr.response ? retryErr.response.data : retryErr.message });
                    }
                }
            }

            return res.status(502).json({ error: 'TotalPay API error', details: apiErrData || apiErr.message });
        }

        if (response.data && response.data.redirect_url) {
            return res.status(200).json({ redirect_url: response.data.redirect_url, payment_id: response.data.payment_id });
        }

        console.error('Unexpected TotalPay response:', response.data);
        return res.status(500).json({ error: 'Failed to initiate payment with TotalPay', details: response.data });

    } catch (err) {
        console.error('Error creating totalpay session', err.response ? err.response.data : err.message);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};

exports.verifyPaymentStatus = async (req, res) => {
    try {
        const { sessionId } = req.query; // pendingOrder ID

        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'Session ID is required' });
        }

        // 1. Check if Order already created
        const existingOrder = await Order.findOne({ stripeSessionId: sessionId }); // Using stripeSessionId to store pendingOrderId/paymentId for consistency
        if (existingOrder) {
            return res.status(200).json({
                success: true,
                paid: true,
                orderId: existingOrder._id
            });
        }

        // 2. Check Pending Order
        const pendingOrder = await PendingOrder.findById(sessionId);
        if (!pendingOrder) {
            console.error('Pending order not found for ID:', sessionId);
            return res.status(404).json({ success: false, message: 'Pending order not found' });
        }

        // 3. Check Status with TotalPay
        // Signature: sha1(md5(strtoupper(order.id + merchant.pass)))
        // Note: order.id here refers to order.number sent in request, which is pendingOrder._id
        const orderIdStr = pendingOrder._id.toString();
        const toMd5 = orderIdStr + totalPayConfig.merchantPass;
        const hash = generateHash(toMd5);

        const statusPayload = {
            merchant_key: totalPayConfig.merchantId,
            order_id: orderIdStr,
            // also send order_number for compatibility
            order_number: orderIdStr,
            hash: hash
        };

        let statusResponse;
        try {
            // Endpoint from docs: {{CHECKOUT_HOST}}/api/v1/payment/status
            const statusUrl = totalPayConfig.statusUrl || "https://checkout.totalpay.global/api/v1/payment/status";
            statusResponse = await axios.post(statusUrl, statusPayload, { headers: { 'Content-Type': 'application/json' } });
        } catch (apiErr) {
            console.error("TotalPay Status API Error:", apiErr.response ? apiErr.response.data : apiErr.message);
            // Return processing so frontend keeps polling? or failed?
            // If API fails, maybe it's too early?
            return res.status(202).json({ success: true, paid: false, processing: true, message: "Verifying payment..." });
        }

        const data = statusResponse.data;
        console.log("TotalPay Status Response:", data);

        if (data.status === 'settled' || data.status === 'approved' || data.status === 'success') {
            // 4. Create Order
            const order = await Order.create({
                user: pendingOrder.userData.user,
                items: pendingOrder.userData.items,
                address: pendingOrder.userData.address,
                paymentMode: 'CARD', // TotalPay
                total: pendingOrder.userData.total,
                paymentStatus: 'PAID',
                stripeSessionId: sessionId // Storing the PendingOrder ID (or could store data.payment_id)
            });

            // 5. Cleanup
            await Cart.deleteMany({ user: pendingOrder.userData.user });
            await PendingOrder.findByIdAndDelete(pendingOrder._id);

            return res.status(200).json({
                success: true,
                paid: true,
                orderId: order._id
            });

        } else if (data.status === 'decline' || data.status === 'error') {
            return res.status(200).json({
                success: true,
                paid: false,
                message: data.reason || 'Payment declined'
            });
        } else {
            // Pending or other status
            return res.status(202).json({
                success: true,
                paid: true, // Frontend logic: if paid=true & processing=true -> shows processing. If paid=false -> shows failed.
                // Wait, frontend says: if paid -> orderId ? success : processing.
                // So if I return paid=true, processing=true, it retries.
                processing: true,
                message: 'Payment is being processed'
            });
        }

    } catch (err) {
        console.error('Error verifying payment status', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Optional: specific verification/callback handler
exports.handleCallback = async (req, res) => {
    try {
        const payload = req.body || {};
        console.log("TotalPay Callback received:", payload);

        const paymentId = payload.id || payload.payment_id || payload.payment_public_id || "";
        const orderNumber = payload.order_number || payload.order_id || payload.order?.number || "";
        const amount = payload.order_amount || payload.amount || payload.order?.amount || "";
        const currency = payload.order_currency || payload.currency || payload.order?.currency || "";
        const description = payload.order_description || payload.order?.description || "";
        const status = (payload.status || payload.order_status || "").toString().toLowerCase();
        const incomingHash = (payload.hash || payload.signature || "").toString();

        // Recompute hash according to TotalPay docs:
        // hash = SHA1( MD5( (payment_public_id + order.number + order.amount + order.currency + order.description + merchant.pass).toUpperCase() ) )
        const toMd5 = (paymentId + orderNumber + amount + currency + description + totalPayConfig.merchantPass).toUpperCase();
        const computedHash = generateHash(toMd5);

        if (!incomingHash || computedHash !== incomingHash) {
            console.error('TotalPay callback signature mismatch', { incomingHash, computedHash });
            return res.status(400).json({ status: 'ERROR', message: 'Invalid signature' });
        }

        // Find pending order
        const pendingOrder = await PendingOrder.findById(orderNumber);
        if (!pendingOrder) {
            console.warn('Pending order not found for orderNumber:', orderNumber);
            // Respond 200 so TotalPay doesn't retry too aggressively; but log for investigation
            return res.status(200).json({ status: 'OK', message: 'Pending order not found' });
        }

        // Map TotalPay status to our internal status
        // According to docs: status can be success, fail, waiting, undefined
        if (status === 'success') {
            // Create final order in DB
            const order = await Order.create({
                user: pendingOrder.userData.user,
                items: pendingOrder.userData.items,
                address: pendingOrder.userData.address,
                paymentMode: 'CARD',
                total: pendingOrder.userData.total,
                transactionId: paymentId,
                status: 'Paid',
                createdAt: new Date()
            });

            // Cleanup
            await Cart.deleteMany({ user: pendingOrder.userData.user });
            await PendingOrder.findByIdAndDelete(pendingOrder._id);

            console.log('Order created from TotalPay callback:', order._id);

            return res.status(200).json({ status: 'OK' });
        }

        // Non-success statuses
        console.log('TotalPay callback status not-success:', status);
        // You can update pending order with latest callback data if desired
        return res.status(200).json({ status: 'OK' });

    } catch (err) {
        console.error('Error handling TotalPay callback', err);
        return res.status(500).json({ status: 'ERROR' });
    }
};

