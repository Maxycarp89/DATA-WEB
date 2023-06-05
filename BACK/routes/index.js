const express = require('express')
const router = express.Router()

const userRoutes = require('./clientRoutes')


router.use('/',userRoutes)



module.exports = router;