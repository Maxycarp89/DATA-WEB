const express = require('express')
const router = express.Router()
const userRoutes = require('./businessRoutes')
const sessionRoutes = require('./sessionRoutes')
const serviceRoutes = require('./serviceRoutes')
const dasboardRoutes = require('./dashboardRoutes')

router.use('/', userRoutes)
router.use('/', sessionRoutes)
router.use('/', serviceRoutes)
router.use('/', dasboardRoutes)

module.exports = router