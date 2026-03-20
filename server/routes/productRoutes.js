const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @route GET /api/products
router.get('/', async (req, res) => {
  try {
    const pageSize = 8; // Number of items per page
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
    const category = req.query.category ? { category: req.query.category } : {};
    
    const count = await Product.countDocuments({ ...keyword, ...category });
    const products = await Product.find({ ...keyword, ...category })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const Order = require('../models/Order');
    
    // Enterprise Amazon Feature: Verified Purchase Only
    const hasBought = await Order.findOne({ 
      user: req.user._id, 
      'orderItems.product': req.params.id,
      status: 'Delivered' 
    });

    if (!hasBought) {
      return res.status(400).json({ message: 'Verified Purchases Only: You can only review products after they are Delivered.' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
      if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this product.' });

      const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
      
      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route POST /api/products (Admin Only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;
    const product = new Product({ name, price, description, image, category, countInStock });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/products/:id (Admin Only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route DELETE /api/products/:id (Admin Only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed perfectly' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
