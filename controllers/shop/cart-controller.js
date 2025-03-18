const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid user or product ID" });
    }

    const product = await Product.findById(toObjectId(productId));
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: toObjectId(userId) });
    if (!cart) {
      cart = new Cart({ userId: toObjectId(userId), items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex === -1) {
      cart.items.push({ productId: toObjectId(productId), quantity });
    } else {
      cart.items[existingIndex].quantity += quantity;
    }

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// Fetch cart
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing user ID" });
    }

    const cart = await Cart.findOne({ userId: toObjectId(userId) }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found!" });
    }

    const validItems = cart.items.filter((item) => item.productId);
    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// Update quantity
const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0 || !isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    const cart = await Cart.findOne({ userId: toObjectId(userId) });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found!" });
    }

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Cart item not present!" });
    }

    cart.items[index].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId?._id || null,
      image: item.productId?.image || null,
      title: item.productId?.title || "Product not found",
      price: item.productId?.price || null,
      salePrice: item.productId?.salePrice || null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// Delete item
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId || !isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    const cart = await Cart.findOne({ userId: toObjectId(userId) }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found!" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId?._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId?._id || null,
      image: item.productId?.image || null,
      title: item.productId?.title || "Product not found",
      price: item.productId?.price || null,
      salePrice: item.productId?.salePrice || null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
