const express = require('express');
const settlementController = require('../controllers/settlementController');

const router = express.Router();

// Routes
router.get('/balances', settlementController.getBalances);
router.get('/', settlementController.getSettlements);

module.exports = router; 