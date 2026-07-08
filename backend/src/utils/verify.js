const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');

(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for verification');

    const userCount = await User.countDocuments();
    const sellerCount = await Seller.countDocuments();
    const productCount = await Product.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Sellers: ${sellerCount}`);
    console.log(`Products: ${productCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Verification error:', error);
    process.exit(1);
  }
})();
