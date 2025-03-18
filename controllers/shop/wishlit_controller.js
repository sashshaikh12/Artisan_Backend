const mongoose = require("mongoose");
const Wishlist = require("../../models/wishlist");
const Product = require("../../models/Product");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
        return res.status(400).json({ success: false, message: "Invalid user or product ID" });
    }
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const product = await Product.findById(productObjectId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    let wishlist = await Wishlist.findOne({ userId: userObjectId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: userObjectId, items: [] });
    }

    const alreadyAdded = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (alreadyAdded) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist!",
      });
    }

    wishlist.items.push({ productId: productObjectId });
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const userObjectId = userId;

    const wishlist = await Wishlist.findOne({ userId: userObjectId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found!",
      });
    }

    const validItems = wishlist.items.filter((item) => item.productId);

    if (validItems.length < wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    const populatedItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populatedItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
        return res.status(400).json({ success: false, message: "Invalid user or product ID" });
    }
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const wishlist = await Wishlist.findOne({ userId: userObjectId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found!",
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId._id.toString() !== productObjectId.toString()
    );

    await wishlist.save();

    const populatedItems = wishlist.items.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populatedItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToWishlist,
  fetchWishlistItems,
  deleteWishlistItem,
};
