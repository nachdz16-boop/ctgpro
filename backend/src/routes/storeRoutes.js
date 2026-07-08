const express = require('express');
const { getStoreData } = require('../controllers/adminController');

const router = express.Router();

router.get('/', getStoreData);

module.exports = router;
