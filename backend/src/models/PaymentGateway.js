const mongoose = require('mongoose');

const PaymentGatewaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  color: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  config: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const PaymentGateway = mongoose.model('PaymentGateway', PaymentGatewaySchema);

PaymentGateway.seedDefaultPaymentGateways = async () => {
  const defaults = [
    {
      name: 'CTGPEO Credit',
      slug: 'ctgpeo-credit',
      icon: '💳',
      color: '#7c3aed',
      status: 'active',
      config: {
        paymentMethod: 'ctgpeo_credit',
        description: 'بوابة الدفع الخاصة باللوحة CTGPEO',
      },
    },
  ];

  for (const gateway of defaults) {
    const existing = await PaymentGateway.findOne({ slug: gateway.slug });
    if (!existing) {
      await PaymentGateway.create(gateway);
    }
  }
};

module.exports = PaymentGateway;
