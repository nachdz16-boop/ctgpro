const express = require('express');
const Seller = require('../models/Seller');

const router = express.Router();

// GET /api/sellers - list sellers (simple)
router.get('/', async (req, res, next) => {
  try {
    const sellers = await Seller.find().lean();
    res.json({ sellers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
