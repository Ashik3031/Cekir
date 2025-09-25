const Cart = require("../models/Cart");
const Counter = require("../models/Counter");
const Order = require("../models/Order");
const { sendMail } = require("../utils/Emails");
const Product = require("../models/Product");
const Variant = require("../models/Variants");
const Address = require("../models/Address");
const usr = require("../models/User");

exports.create = async (req, res) => {
  try {
    const { user, items, address: addressId, paymentMode, total } = req.body;
    console.log(req.body);
    if (!user || !items || !addressId || !paymentMode || !total) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const addr = await Address.findOne({ _id: addressId, user });
    if (!addr) return res.status(404).json({ message: "Address not found" });


    const userData = await usr.findById(user);   
    if (!userData) return res.status(404).json({ message: "User not found" });

    const userEmail = userData.email;
    if (!userEmail) return res.status(400).json({ message: "User email not found" });

const addressSnapshot = {
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phoneNumber: addr.phoneNumber,
      type: addr.type,
      addressId: addr._id, // only if you kept this field in Order.address
    };


    const counter = await Counter.findOneAndUpdate(
      { name: "order" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const orderNo = counter.value;

    const finalItems = [];

    for (const item of items) {
      const { variantId, quantity } = item;

      if (!variantId || quantity == null) {
        return res.status(400).json({ message: "Missing variantId or quantity" });
      }

      const variant = await Variant.findById(variantId).populate("product");
      if (!variant) {
        return res.status(404).json({ message: `Variant not found: ${variantId}` });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${variant.product?.name || "product"} ${JSON.stringify(variant.optionValues)}`
        });
      }

      variant.stock -= quantity;
      await variant.save();

      finalItems.push({
        variant: variant._id,
        product: variant.product._id,
        optionValues: variant.optionValues,
        quantity,
        price: variant.price,
      });
    }

    const created = await Order.create({
      user,
      userEmail,
      items: finalItems,
      address: addressSnapshot,
      paymentMode,
      total,
      orderNo,
      status: "Pending",
    });

    await Cart.deleteMany({ user });

    await sendMail(
      process.env.OWNER_EMAIL,
      "New Order Received - Barosa Shopping",
      `<h2>New Order Received</h2>
      <p>Order Total: AED ${total}</p>
      <p>Payment Mode: ${paymentMode}</p>
      <p>Process the order as soon as possible.</p>`
    );

    res.status(201).json(created);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error creating an order, please try again later", error: error.message });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await Order.find({ user: id }).populate({
      path: "items.variant",
      populate: {
        path: "product",
        model: "Product"
      }
    });

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching orders, please try again later" });
  }
};


exports.getByOrderId = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate({
      path: "items.product",
      model: "Product",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching orders, please try again later" });
  }
};

// controllers/order.js
// controllers/order.js
// controllers/order.js



exports.getAll = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 0; // 0 = no limit
    const skip = pageSize ? pageSize * (page - 1) : 0;

    const query = {};

    const [totalDocs, results] = await Promise.all([
      Order.countDocuments(query).exec(),
      Order.find(query)
        .skip(skip)
        .limit(pageSize)
        // ✅ Get user name + any likely phone fields
        .populate({
          path: "user",
          select:
            "name firstName lastName email phone phoneNumber mobile mobileNumber contact contactNumber whatsapp",
        })
        // ✅ Get product name/title + images for item display
        .populate({
          path: "items.product",
          select: "name title defaultImages thumbnail",
        })
        // ✅ Optional but helpful for attrs/images when variant exists
        .populate({
          path: "items.variant",
          select: "title images attributes optionValues sku slug",
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);

    res.header("X-Total-Count", String(totalDocs));
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching orders, please try again later" });
  }
};



exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Order.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error updating order, please try again later" });
  }
};
