const express = require("express");
const router = express.Router();
const dasboardControllers = require("../controllers/services/dasboardControllers");

// GET DATA
router.get("/getOwnServices", dasboardControllers.getOwnServices);
router.get("/getOwnHomeServices", dasboardControllers.getOwnHomeServices);

module.exports = router;
