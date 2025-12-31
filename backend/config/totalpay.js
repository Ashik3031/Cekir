const totalPayConfig = {
    merchantId: process.env.TOTALPAY_MERCHANT_ID || "0d5a725a-dbee-11f0-a7f6-7e8ddb869b9d",
    merchantPass: process.env.TOTALPAY_SECRET || "d54c57b6ab61f603fbf3941ac2c9570f",
    baseUrl: process.env.TOTALPAY_BASE_URL || "https://checkout.totalpay.global/api/v1/session",
    statusUrl: process.env.TOTALPAY_STATUS_URL || "https://checkout.totalpay.global/api/v1/payment/status"
};

module.exports = totalPayConfig;
