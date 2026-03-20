const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isPrime: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{
    label: { type: String, required: true }, // e.g., 'Home', 'Office'
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  }],
  notifications: [{
    message: String,
    type: { type: String, enum: ['Order', 'System', 'Promo'], default: 'Order' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
