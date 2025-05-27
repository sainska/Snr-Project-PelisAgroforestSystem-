const express = require('express');
const { getAllPlots } = require('../controllers/plotController');

const router = express.Router();
router.get('/', getAllPlots);

module.exports = router;
