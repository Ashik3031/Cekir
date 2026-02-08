const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "backend", ".env") });

const Product = require("./backend/models/Product");
const Variant = require("./backend/models/Variants");

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const productName = "Divine Premium Velvet Islamic Prayer Mat - Sultanah Mosque Pattern";
        const product = await Product.findOne({ name: productName });

        if (!product) {
            console.log("Product not found");
            return;
        }

        console.log("--- PRODUCT ---");
        console.log(JSON.stringify(product, null, 2));

        const variants = await Variant.find({ product: product._id }).lean();
        console.log("--- VARIANTS ---");
        console.log(JSON.stringify(variants, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
