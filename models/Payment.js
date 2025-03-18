const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        default: "Payment for services/products",
    },
    error: {
        type: String,
        default: null,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Payment", PaymentSchema);
