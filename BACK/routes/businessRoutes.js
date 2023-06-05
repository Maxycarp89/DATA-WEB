const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

// GET DATA
router.get('/BusinessPartners', businessController.BusinessPartners);
router.get('/getStates', businessController.getStates);

// POST DATA
router.post('/BusinessPartners', businessController.PostBusinessPartners);

//PATCH DATA
router.patch('/PatchBusinessPartnersCel', businessController.PatchBusinessPartnersCel);


module.exports = router;