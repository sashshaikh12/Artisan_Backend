const express=require("express")
const {createOrder,verifyPayment}= require("../../controllers/payment/payment_controller");



const  router=express.Router();

router.post("/create-order", createOrder);       // To create an order
router.post("/verify-payment", verifyPayment);   // To verify payment

module.exports=router;