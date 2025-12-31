const axios = require('axios');
const CryptoJS = require('crypto-js');
require('dotenv').config();

if (process.argv.length < 6) {
  console.log('Usage: node test-callback.js <pendingOrderId> <amount> <currency> <description> [paymentId]');
  process.exit(1);
}

const [,, orderNumber, amount, currency, description, paymentIdArg] = process.argv;
const paymentId = paymentIdArg || 'test-payment-id-123';

const merchantPass = process.env.TOTALPAY_SECRET;

const toMd5 = (paymentId + orderNumber + amount + currency + description + merchantPass).toUpperCase();
const hash = CryptoJS.SHA1(CryptoJS.MD5(toMd5).toString()).toString(CryptoJS.enc.Hex);

const payload = {
  id: paymentId,
  order_number: orderNumber,
  order_amount: amount,
  order_currency: currency,
  order_description: description,
  status: 'success',
  type: 'sale',
  hash
};

console.log('Sending test callback payload:', payload);

axios.post('http://localhost:4001/checkout/callback', payload)
  .then(res => console.log('Webhook response:', res.data))
  .catch(err => console.error('Webhook error:', err.response ? err.response.data : err.message));
