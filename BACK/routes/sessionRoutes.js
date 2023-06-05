const express = require('express');
const router = express.Router();
const sessionControllers = require('../controllers/sessionControllers');

router.post('/login', sessionControllers.login)
router.post('/logout', sessionControllers.logout)
router.post('/NewClient', sessionControllers.NewClient)
router.post('/loginAgain', sessionControllers.loginAgain)

router.patch('/changepassword', sessionControllers.changePassword)


router.get('/users', sessionControllers.users)
router.get('/almacenes', sessionControllers.almacenes)

module.exports = router;