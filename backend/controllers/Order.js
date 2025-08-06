const Cart = require("../models/Cart");
const Counter = require("../models/Counter");
const Order = require("../models/Order");
const { sendMail } = require("../utils/Emails");
const Product = require("../models/Product");
const Variant = require("../models/Variants");

exports.create = async (req, res) => {
  try {
    const { user, items, address, paymentMode, total } = req.body;

    if (!user || !items || !address || !paymentMode || !total) {
      return res.status(400).json({ message: "Invalid request body" });
    }

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
      items: finalItems,
      address,
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

exports.getAll = async (req, res) => {
  try {
    let skip = 0;
    let limit = 0;

    if (req.query.page && req.query.limit) {
      const pageSize = req.query.limit;
      const page = req.query.page;
      skip = pageSize * (page - 1);
      limit = pageSize;
    }

    const totalDocs = await Order.find({}).countDocuments().exec();
    const results = await Order.find({})
      .skip(skip)
      .limit(limit)
      .populate("items.product")
      .exec();

    res.header("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
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
