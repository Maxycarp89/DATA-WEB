const express = require('express');
const router = express.Router();

const clientControllers = require ("../controllers/clientControllers")

// GET DATA
router.get('/clientData', clientControllers.ClientPartners);



module.exports = router;