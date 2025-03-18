const express = require('express');

const getAllAdmins= require("../../controllers/common/admins_controller");

const router = express.Router();


router.get('/get-admins',getAllAdmins);

module.exports = router;