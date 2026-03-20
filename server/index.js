const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());

// Database Connection
console.log('Attempting to connect to MongoDB URI:', process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-store');
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-store')
  .then(() => {
    console.log('✅ Enterprise MongoDB Connected!');
    
    // Amazon AI Dynamic Pricing Engine
    const Product = require('./models/Product');
    setInterval(async () => {
      try {
        const products = await Product.aggregate([{ $match: { price: { $gt: 10 } } }, { $sample: { size: 3 } }]);
        for (const p of products) {
          const product = await Product.findById(p._id);
          if (product) {
            const factor = 1 + (Math.random() * 0.04 - 0.02); // -2% to +2% Market Shift
            product.price = Math.round((product.price * factor) * 100) / 100;
            await product.save();
          }
        }
        console.log('[AI Pricing Engine] 💸 Adjusted global marketplace supply/demand margins.');
      } catch (error) {
        console.log('AI Pricing Update Failed', error.message);
      }
    }, 1000 * 60 * 60); // Evaluates live every 1 Hour
  })
  .catch((err) => console.log('❌ DB Connection Error:', err));

// Routing
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/config/razorpay', (req, res) =>
  res.send(process.env.RAZORPAY_KEY_ID || 'rzp_test_yOaLpX9R2A1nFv')
);

app.get('/', (req, res) => {
  res.send('API is fully functional and running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 E-Commerce Architecture blazing on port ${PORT}`);
});
