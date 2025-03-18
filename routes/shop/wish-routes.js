const express = require("express");

const { 
    addToWishlist,
    fetchWishlistItems,
    deleteWishlistItem ,
} = require("../../controllers/shop/wishlit_controller");

const router = express.Router();

router.post("/add", addToWishlist);
router.get("/get/:userId", fetchWishlistItems);
router.delete("/:userId/:productId", deleteWishlistItem);

module.exports = router;
