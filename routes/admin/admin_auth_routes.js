const express = require('express')


const {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    adminAuthMiddleware,
  }= require("..//../controllers/admin/auth_admin_controller");

const router = express.Router();

router.post("/admin-register", registerAdmin);

router.post("/admin-login", loginAdmin);

router.post("/admin-logout", logoutAdmin);

router.get("/admin-check-auth", adminAuthMiddleware, (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        message: "Authenticated admin!",
        admin: user
    });
});

module.exports = router;
