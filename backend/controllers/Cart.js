const Cart = require("../models/Cart");

// exports.create=async(req,res)=>{
//     try {
//         const created=await new Cart(req.body).populate({path:"product"});
//         await created.save()
//         res.status(201).json(created)
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({message:'Error adding product to cart, please trying again later'})
//     }
// }

exports.create = async (req, res) => {
  try {
    const { user, variant, quantity } = req.body;

    if (!variant || !quantity) {
      return res.status(400).json({ message: "Missing variant or quantity" });
    }

    // Check if item already exists for this user+variant
    let cartItem = await Cart.findOne({ user, variant });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({ user, variant, quantity });
    }

    await cartItem.save();
    await cartItem.populate({
      path: "variant",
      populate: { path: "product" },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error adding item to cart, please try again later",
    });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItems = await Cart.find({ user: id }).populate({
      path: "variant",
      populate: { path: "product" },
    });
    res.status(200).json(cartItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching cart items, please try again later",
    });
  }
};


// exports.updateById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { quantity, size } = req.body;
//     //
//     const updated = await Cart.findByIdAndUpdate(id, req.body, {
//       new: true,
//     }).populate({ path: "product", populate: { path: "brand" } });
//     res.status(200).json(updated);
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({
//         message: "Error updating cart items, please trying again later",
//       });
//   }
// };

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity = quantity ?? cartItem.quantity;

    await cartItem.save();
    await cartItem.populate({
      path: "variant",
      populate: { path: "product" },
    });

    res.status(200).json(cartItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating cart item",
    });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cart.findByIdAndDelete(id);
    res.status(200).json(deleted);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error deleting cart item, please trying again later" });
  }
};

exports.deleteByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    await Cart.deleteMany({ user: id });
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Some Error occured while resetting your cart" });
  }
};
