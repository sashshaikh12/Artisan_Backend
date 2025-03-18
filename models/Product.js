const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    admin:String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
