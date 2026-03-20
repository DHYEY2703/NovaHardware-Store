const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

const sendEmail = require('../utils/mailer');
const generateInvoicePDF = require('../utils/pdfGenerator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderItems: orderItems.map((x) => ({ 
        ...x, 
        quantity: x.qty, 
        product: x._id, 
        _id: undefined 
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Send Digital Invoice Mail
    // Generate MJML dynamically
    const orderDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const orderTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const orderId = createdOrder._id.toString().slice(-8).toUpperCase();

    const mjmlOrder = `
<mjml>
  <mj-head>
    <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"></mj-font>
    <mj-attributes>
      <mj-text font-family="'Inter',Helvetica,Arial,sans-serif"></mj-text>
    </mj-attributes>
    <mj-style>
      p { margin: 0px 0px 0px 0px !important; }
      .fd-text a { color: unset; text-decoration: underline; }
      .fd-accountid p { background: #f1f2de; border-radius: 99px; padding: 10px 15px; text-align: center; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#173831">
    <mj-section background-color="transparent" padding="20px 0px">
      <mj-column width="100%">
        <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">Your NovaHardware Order Confirmation</mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Hero -->
    <mj-section border-radius="8px" padding="0px" background-color="#155F50">
      <mj-column width="55%" padding="40px">
        <mj-text font-size="20px" line-height="30px" font-weight="700" padding="0px" align="left" color="#FEFFEA">
          <p>Hello ${req.user.name.split(' ')[0]},</p>
          <p>Thanks for your order!</p>
        </mj-text>
        <mj-spacer height="14px"></mj-spacer>
        <mj-text font-size="14px" line-height="20px" padding="0px" align="left" color="#cfdfcb">Here is the receipt of your order placed on ${orderDate} at ${orderTime}.</mj-text>
      </mj-column>
      <mj-column vertical-align="bottom" width="45%">
        <mj-image align="center" padding="0px" src="https://github.com/ricfreire/mautic-theme-fooddelivery/blob/main/assets/moto.png?raw=true"></mj-image>
      </mj-column>
    </mj-section>
    
    <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

    <!-- Products Header -->
    <mj-section padding="30px 40px 26px 40px" border-radius="8px 8px 0px 0px" background-color="#FEFFEA">
      <mj-column width="50%" vertical-align="middle">
        <mj-text font-size="16px" color="#0A0908" font-weight="700" padding="0px">Products</mj-text>
      </mj-column>
      <mj-column width="2%"><mj-spacer height="14px"></mj-spacer></mj-column>
      <mj-column width="48%" vertical-align="middle">
        <mj-text css-class="fd-accountid" color="#0A0908" font-size="10px" padding="0px">
          <p>Order #${orderId}</p>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Product Items -->
    ${orderItems.map(item => `
    <mj-section padding="0px 40px 26px 40px" background-color="#FEFFEA">
      <mj-column width="10%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">x${item.qty}</mj-text>
      </mj-column>
      <mj-column width="70%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px">${item.name}</mj-text>
      </mj-column>
      <mj-column width="20%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" align="right" font-weight="600">$${(item.price * item.qty).toFixed(2)}</mj-text>
      </mj-column>
    </mj-section>
    `).join('')}

    <!-- Totals -->
    <mj-section padding="26px 40px" background-color="#f1f2de">
      <mj-column width="80%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" color="#0A0908" font-weight="700" padding="0px">Subtotal (${orderItems.length} item${orderItems.length > 1 ? 's' : ''})</mj-text>
      </mj-column>
      <mj-column width="20%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" align="right">$${itemsPrice.toFixed(2)}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px 40px 26px 40px" background-color="#f1f2de">
      <mj-column width="80%" vertical-align="middle">
        <mj-text font-size="14px" color="#0A0908" padding="0px">Shipping</mj-text>
      </mj-column>
      <mj-column width="20%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" align="right">${shippingPrice > 0 ? '$' + shippingPrice.toFixed(2) : 'FREE'}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px 40px 26px 40px" background-color="#f1f2de">
      <mj-column width="80%" vertical-align="middle">
        <mj-text font-size="14px" color="#0A0908" padding="0px">Tax (15%)</mj-text>
      </mj-column>
      <mj-column width="20%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" align="right">$${taxPrice.toFixed(2)}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#f1f2de" padding="0px 0px">
      <mj-column><mj-divider border-style="dashed" padding="0px 40px" border-color="#dadbc9" border-width="1.5px"></mj-divider></mj-column>
    </mj-section>

    <mj-section padding="26px 40px" background-color="#f1f2de">
      <mj-column width="80%" vertical-align="middle">
        <mj-text line-height="26px" font-size="18px" color="#0A0908" font-weight="900" padding="0px">Total Paid</mj-text>
      </mj-column>
      <mj-column width="20%" vertical-align="middle">
        <mj-text line-height="26px" font-size="18px" font-weight="900" padding="0px" align="right">$${totalPrice.toFixed(2)}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px 40px 20px 40px" background-color="#f1f2de">
      <mj-column vertical-align="middle" width="100%">
        <mj-text line-height="20px" font-size="14px" padding="0px">Paid with <b>${paymentMethod}</b></mj-text>
      </mj-column>
    </mj-section>

    <mj-section border-radius="0px 0px 8px 8px" padding="0px 40px 26px 40px" background-color="#f1f2de">
      <mj-column>
        <mj-text color="#636363" line-height="16px" font-size="10px" padding="0px">The receipt prices include the obligatory country tax, in compliance with legal requirements.</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

    <!-- Delivery Details -->
    <mj-section padding="30px 40px 26px 40px" border-radius="8px 8px 0px 0px" background-color="#FEFFEA">
      <mj-column width="50%" vertical-align="middle">
        <mj-text font-size="16px" color="#0A0908" font-weight="700" padding="0px">Shipping To</mj-text>
      </mj-column>
      <mj-column width="2%"><mj-spacer height="14px"></mj-spacer></mj-column>
      <mj-column width="48%" vertical-align="middle">
        <mj-text css-class="fd-accountid" color="#0A0908" font-size="10px" padding="0px">
          <p>Delivery #${orderId}</p>
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px 40px 20px 40px" background-color="#FEFFEA">
      <mj-column width="25%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">Address</mj-text>
      </mj-column>
      <mj-column width="75%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px">${shippingAddress.address}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px 40px 20px 40px" background-color="#FEFFEA">
      <mj-column width="25%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">City</mj-text>
      </mj-column>
      <mj-column width="75%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px">${shippingAddress.city}, ${shippingAddress.postalCode || ''}</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="0px 40px 20px 40px" background-color="#FEFFEA">
      <mj-column width="25%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">Country</mj-text>
      </mj-column>
      <mj-column width="75%" vertical-align="middle">
        <mj-text line-height="20px" font-size="14px" padding="0px">${shippingAddress.country || 'India'}</mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section border-radius="0px 0px 8px 8px" padding="0px 40px 26px 40px" background-color="#FEFFEA">
      <mj-column>
        <mj-text color="#636363" line-height="16px" font-size="10px" padding="0px">Estimated delivery within 3-7 business days. We'll email you when it ships.</mj-text>
      </mj-column>
    </mj-section>
    
    <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

    <!-- Track Order CTA -->
    <mj-section border-radius="8px" padding="0px" background-color="#D1472C">
      <mj-column width="100%" padding="40px">
        <mj-text font-size="20px" line-height="30px" font-weight="700" padding="0px" align="left" color="#FEFFEA">Track your order</mj-text>
        <mj-spacer height="14px"></mj-spacer>
        <mj-text font-size="14px" line-height="20px" padding="0px" align="left" color="#fff">Log in to your NovaHardware dashboard to view real-time delivery updates and order history.</mj-text>
        <mj-spacer height="18px"></mj-spacer>
        <mj-button font-family="'Inter',Helvetica,Arial,sans-serif" border-radius="8px" inner-padding="12px 24px" font-size="14px" background-color="#f1c7bf" color="#0A0908" align="left" padding="0px" href="http://localhost:5173/profile">View Dashboard</mj-button>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="transparent" padding="30px 0px">
      <mj-column width="100%">
        <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">
          <p><b>Issues with your order?</b></p>
          <p>Contact us at <a href="mailto:help@novahardware.com">help@novahardware.com</a>.</p>
        </mj-text>
        <mj-spacer height="16px"></mj-spacer>
        <mj-text css-class="fd-text" padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px">Crafted with love by Dhyey Barbhaya.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
    `;

    // Compile MJML to HTML with fallback
    let invoiceHtml = '';
    try {
      const mjml2html = require('mjml');
      invoiceHtml = mjml2html(mjmlOrder).html;
    } catch (err) {
      console.log('MJML compilation failed, using fallback');
      invoiceHtml = `<h3>Your NovaHardware Order Confirmed: #${orderId}</h3>`;
    }

    
    // Generate PDF invoice and attach it
    let attachments = [];
    try {
      // Build a clean order object for the PDF (use req.body orderItems which have `qty`)
      const pdfOrder = {
        _id: createdOrder._id,
        shippingAddress,
        orderItems: orderItems.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
      };
      const pdfBuffer = await generateInvoicePDF(pdfOrder, req.user);
      console.log(`[PDF] ✅ Invoice PDF generated successfully (${pdfBuffer.length} bytes)`);
      attachments = [{
        filename: `NovaHardware_Invoice_${createdOrder._id.toString().slice(-6).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }];
    } catch (pdfErr) {
      console.error('[PDF] ❌ Failed to generate invoice PDF:', pdfErr.message);
    }

    sendEmail({ email: req.user.email, subject: `NovaHardware Order Confirmation: ${createdOrder._id}`, html: invoiceHtml, attachments });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
});

// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

const Razorpay = require('razorpay');

// @route   POST /api/orders/:id/create-razorpay-order
// @access  Private
router.post('/:id/create-razorpay-order', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Initialize Razorpay securely
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_h5V9aUf4S7hX4J', // Replace in .env
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'ZJhXq3aUf4S7hX4J9aUf4S7', // Replace in .env
    });

    // Razorpay completely operates in INR (Paise), multiply by 100
    const options = {
      amount: Math.round(order.totalPrice * 100), // Final Amount in Paise
      currency: 'INR',
      receipt: `rcpt_order_${order._id}`
    };

    const rzpOrder = await razorpay.orders.create(options);
    res.json(rzpOrder);
  } catch (error) {
    res.status(500).json({ message: 'Razorpay Order Generation Failed', error: error.message });
  }
});

// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @route   PUT /api/orders/:id/deliver (Admin Only) // Deprecated mostly for /status now, keeping.
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @route   PUT /api/orders/:id/status (Admin Only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status;
    
    if (req.body.status === 'Shipped') order.shippedAt = Date.now();
    if (req.body.status === 'Out for Delivery') order.outForDeliveryAt = Date.now();
    if (req.body.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Add Notification + Send Status Email
    const user = await require('../models/User').findById(order.user);
    if (user) {
      user.notifications.push({
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${order.status}`,
        type: 'Order'
      });
      await user.save();

      // Send Status Update Email
      const sendEmail = require('../utils/mailer');
      const orderId = order._id.toString().slice(-6).toUpperCase();
      const firstName = user.name.split(' ')[0];
      const statusColor = req.body.status === 'Shipped' ? '#1D4ED8' : req.body.status === 'Out for Delivery' ? '#D97706' : '#059669';
      const statusIcon = req.body.status === 'Shipped' ? '📦' : req.body.status === 'Out for Delivery' ? '🚚' : '✅';
      const statusMsg = req.body.status === 'Shipped' 
        ? 'Your order has been shipped and is on its way!' 
        : req.body.status === 'Out for Delivery' 
        ? 'Your order is out for delivery and will arrive soon!' 
        : 'Your order has been successfully delivered!';

      const mjmlStatus = `
      <mjml>
        <mj-head>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"></mj-font>
          <mj-attributes>
            <mj-text font-family="'Inter',Helvetica,Arial,sans-serif"></mj-text>
          </mj-attributes>
          <mj-style>
            p { margin: 0px 0px 0px 0px !important; }
            .fd-text a { color: unset; text-decoration: underline; }
            .fd-accountid p { background: #f1f2de; border-radius: 99px; padding: 10px 15px; text-align: center; }
          </mj-style>
        </mj-head>
        <mj-body background-color="#173831">
          <mj-section background-color="transparent" padding="20px 0px">
            <mj-column width="100%">
              <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">Order Status Update</mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section border-radius="8px" padding="0px" background-color="#155F50">
            <mj-column width="100%" padding="40px">
              <mj-text font-size="20px" line-height="30px" font-weight="700" padding="0px" align="left" color="#FEFFEA">
                <p>Hello ${firstName},</p>
                <p>${statusIcon} Order ${req.body.status}</p>
              </mj-text>
              <mj-spacer height="14px"></mj-spacer>
              <mj-text font-size="14px" line-height="20px" padding="0px" align="left" color="#cfdfcb">${statusMsg}</mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

          <mj-section padding="30px 40px 26px 40px" border-radius="8px 8px 0px 0px" background-color="#FEFFEA">
            <mj-column width="50%" vertical-align="middle">
              <mj-text font-size="16px" color="#0A0908" font-weight="700" padding="0px">Order Details</mj-text>
            </mj-column>
            <mj-column width="2%"><mj-spacer height="14px"></mj-spacer></mj-column>
            <mj-column width="48%" vertical-align="middle">
              <mj-text css-class="fd-accountid" color="#0A0908" font-size="10px" padding="0px">
                <p>Order #${orderId}</p>
              </mj-text>
            </mj-column>
          </mj-section>

          <mj-section padding="0px 40px 26px 40px" background-color="#FEFFEA">
            <mj-column width="30%" vertical-align="middle">
              <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">Status</mj-text>
            </mj-column>
            <mj-column width="70%" vertical-align="middle">
              <mj-text line-height="20px" font-size="14px" padding="0px" color="${statusColor}" font-weight="700">${statusIcon} ${req.body.status}</mj-text>
            </mj-column>
          </mj-section>

          <mj-section padding="0px 40px 26px 40px" background-color="#FEFFEA">
            <mj-column width="30%" vertical-align="middle">
              <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">Total</mj-text>
            </mj-column>
            <mj-column width="70%" vertical-align="middle">
              <mj-text line-height="20px" font-size="14px" padding="0px">$${order.totalPrice.toFixed(2)}</mj-text>
            </mj-column>
          </mj-section>

          <mj-section padding="0px 40px 26px 40px" border-radius="0px 0px 8px 8px" background-color="#FEFFEA">
            <mj-column width="30%" vertical-align="middle">
              <mj-text line-height="20px" font-size="14px" padding="0px" font-weight="700">Delivery</mj-text>
            </mj-column>
            <mj-column width="70%" vertical-align="middle">
              <mj-text line-height="20px" font-size="14px" padding="0px">${order.shippingAddress.address}, ${order.shippingAddress.city}</mj-text>
            </mj-column>
          </mj-section>

          <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

          <mj-section border-radius="8px" padding="0px" background-color="#D1472C">
            <mj-column width="100%" padding="40px">
              <mj-text font-size="20px" line-height="30px" font-weight="700" padding="0px" align="left" color="#FEFFEA">Track your order</mj-text>
              <mj-spacer height="14px"></mj-spacer>
              <mj-text font-size="14px" line-height="20px" padding="0px" align="left" color="#fff">Log in to your NovaHardware dashboard to view real-time delivery updates.</mj-text>
              <mj-spacer height="18px"></mj-spacer>
              <mj-button font-family="'Inter',Helvetica,Arial,sans-serif" border-radius="8px" inner-padding="12px 24px" font-size="14px" background-color="#f1c7bf" color="#0A0908" align="left" padding="0px" href="http://localhost:5173/profile">View Order</mj-button>
            </mj-column>
          </mj-section>

          <mj-section background-color="transparent" padding="30px 0px">
            <mj-column width="100%">
              <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">
                <p><b>Issues with your order?</b></p>
                <p>Contact us at <a href="mailto:help@novahardware.com">help@novahardware.com</a>.</p>
              </mj-text>
              <mj-spacer height="16px"></mj-spacer>
              <mj-text css-class="fd-text" padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px">Crafted with love by Dhyey Barbhaya.</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;

      let statusHtml = '';
      try {
        const mjml2html = require('mjml');
        statusHtml = mjml2html(mjmlStatus).html;
      } catch (err) {
        statusHtml = `<h3>Your order #${orderId} is now ${req.body.status}</h3>`;
      }

      sendEmail({ email: user.email, subject: `${statusIcon} Order #${orderId} - ${req.body.status}`, html: statusHtml });
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @route   PUT /api/orders/:id/return (RMA Engine)
// @access  Private
router.put('/:id/return', protect, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order && order.user.toString() === req.user._id.toString()) {
    if (order.isDelivered && order.returnStatus === 'None') {
      order.returnReason = req.body.reason || 'No reason provided';
      order.returnStatus = 'Requested';
      
      const updatedOrder = await order.save();
      
      // Add Admin Notification (Optional, we add to user for now stating it's requested)
      const user = await require('../models/User').findById(req.user._id);
      user.notifications.push({
        message: `Return requested for order #${order._id.toString().slice(-6).toUpperCase()}`,
        type: 'System'
      });
      await user.save();

      res.json(updatedOrder);
    } else {
      res.status(400).json({ message: 'Order is not eligible for return request' });
    }
  } else {
    res.status(404).json({ message: 'Order not found or unauthorized' });
  }
});

// @route   PUT /api/orders/:id/return-action (Admin Return Management)
// @access  Admin
router.put('/:id/return-action', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const { action } = req.body; // 'Approved' or 'Rejected'

    if (action === 'Approved') {
      order.returnStatus = 'Approved';
      order.isReturned = true;
      order.returnedAt = Date.now();
      order.refundAmount = order.totalPrice;

      // Restock inventory
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.quantity;
          await product.save();
        }
      }

      // Send refund confirmation email
      const user = await require('../models/User').findById(order.user);
      if (user) {
        const sendEmail = require('../utils/mailer');
        const refundHtml = `
        <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: auto; padding: 40px; border-radius: 16px; background: linear-gradient(145deg, #ffffff, #fefce8); border: 1px solid #fde68a;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #92400e; margin: 0; font-size: 28px; font-weight: 900;">Return Approved ✅</h1>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hello ${user.name.split(' ')[0]},</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Your return request for Order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been approved.</p>
          <div style="background: #ecfdf5; border: 1px solid #6ee7b7; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
            <p style="color: #065f46; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 700;">Refund Amount</p>
            <p style="color: #059669; font-size: 32px; font-weight: 900; margin: 0;">$${order.totalPrice.toFixed(2)}</p>
          </div>
          <p style="color: #111827; font-size: 15px; text-align: center; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Thank you from NOVA by Dhyey</p>
        </div>`;
        sendEmail({ email: user.email, subject: `Return Approved - Order #${order._id.toString().slice(-6).toUpperCase()}`, html: refundHtml });

        user.notifications.push({
          message: `Return Approved for order #${order._id.toString().slice(-6).toUpperCase()}. Refund: $${order.totalPrice.toFixed(2)}`,
          type: 'Order'
        });
        await user.save();
      }
    } else if (action === 'Rejected') {
      order.returnStatus = 'Rejected';
      const user = await require('../models/User').findById(order.user);
      if (user) {
        user.notifications.push({
          message: `Return Rejected for order #${order._id.toString().slice(-6).toUpperCase()}.`,
          type: 'System'
        });
        await user.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

module.exports = router;
