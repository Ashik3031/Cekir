const axios = require('axios');
const fs = require('fs');

const merchantId = "0d5a725a-dbee-11f0-a7f6-7e8ddb869b9d"; // Test Merchant Key provided
const merchantKey = "0d5a725a-dbee-11f0-a7f6-7e8ddb869b9d"; // Ensure test uses same key for checks
const url = "https://checkout.totalpay.global/api/v1/session";

const logStream = fs.createWriteStream('key-test.log', { flags: 'w' });

const log = (msg) => {
    console.log(msg);
    logStream.write(msg + '\n');
};

const testKey = async (keyName, keyValue) => {
    log(`Testing with ${keyName}: ${keyValue}`);
    try {
        const payload = {
            merchant_key: keyValue,
            operation: 'purchase',
            methods: ['card'],
            order: {
                number: "test-123",
                amount: "1.00",
                currency: "AED",
                description: "Test Order"
            },
            cancel_url: "http://localhost/cancel",
            success_url: "http://localhost/success",
            hash: "dummy_hash_for_test"
        };

        const response = await axios.post(url, payload);
        log(`[PASS] Response for ${keyName}: ${JSON.stringify(response.data)}`);
    } catch (error) {
        if (error.response) {
            log(`[FAIL] Error for ${keyName}: ${JSON.stringify(error.response.data)}`);
        } else {
            log(`[FAIL] Network/Other Error for ${keyName}: ${error.message}`);
        }
    }
    log("------------------------------------------------");
};

const run = async () => {
    await testKey("Merchant ID (Current Config)", merchantId);
    await testKey("Merchant Key (Swapped)", merchantKey);
    logStream.end();
};

run();
