const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  status: { type: String, enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'], default: 'Processing' },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  shippedAt: { type: Date },
  outForDeliveryAt: { type: Date },
  isReturned: { type: Boolean, default: false },
  returnedAt: { type: Date },
  returnReason: { type: String },
  returnStatus: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected', 'Refunded'], default: 'None' },
  refundAmount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
