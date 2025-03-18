const crypto = require("crypto");
const razorpayInstance = require("../../config/razorpay");
const Payment=require("../../models/payment")
const createOrder=async(req, res) => {
   
    try {
        const { amount, currency, receipt } = req.body;
    
        const options = {
          amount: amount * 100,  // Amount in paise (multiply by 100)
          currency: currency || "INR",
          receipt: receipt || `receipt_${Date.now()}`,
        
        };
    
        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
          success: true,
          message: "Order created successfully",
          order,
        });
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create order",
          error: error.message,
        });
      }
    };
// ROUTE 2 : Create Verify Api Using POST Method http://localhost:4000/api/payment/verify
const verifyPayment= async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // console.log("req.body", req.body);

    try {
        // Create Sign
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        // Create ExpectedSign
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // console.log(razorpay_signature === expectedSign); 

        // Create isAuthentic
        const isAuthentic = expectedSign === razorpay_signature;

        // Condition 
        if (isAuthentic) {
            // Save payment details to the database
            const payment = new Payment({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              status: "success",
              amount: req.body.amount,
              currency: req.body.currency,
            });
      
            await payment.save();
      
            res.status(200).json({
              success: true,
              message: "Payment verified and stored successfully",
            });
          } else {
            res.status(400).json({
              success: false,
              message: "Payment verification failed",
            });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message,
          });
        }
      };
      
      module.exports = {
        createOrder,
        verifyPayment,
      };