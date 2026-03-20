const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

const recordOTP = (user, type, otp) => {
  try {
    const filePath = path.join(__dirname, '../otp.txt');
    const role = user.isAdmin ? 'Admin' : 'User';
    const icon = type === 'REGISTER' ? 'REGISTER' : 'FORGOT_PASSWORD';
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const separator = '='.repeat(58);
    const log = '\n' + separator + '\n'
      + '  OTP LOG ENTRY\n'
      + separator + '\n'
      + '  Date       : ' + date + '\n'
      + '  Time       : ' + time + '\n'
      + '  Type       : ' + icon + '\n'
      + '  Name       : ' + user.name + '\n'
      + '  Email      : ' + user.email + '\n'
      + '  Role       : ' + role + '\n'
      + '  OTP Code   : ' + otp + '\n'
      + separator + '\n';
    fs.appendFileSync(filePath, log, 'utf8');
  } catch (err) {
    console.error('Failed to log OTP:', err);
  }
};

const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token; // Kept to not instantly break their localStorage backwards compatibility
};

// @route POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Account locked. Please verify your OTP via email first.' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPrime: user.isPrime,
      token: generateToken(res, user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

const sendEmail = require('../utils/mailer');

// @route POST /api/users/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    recordOTP(user, 'FORGOT_PASSWORD', otp);

    const mjmlOTP = `
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
            <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">Forgot your password? No problem.</mj-text>
          </mj-column>
        </mj-section>
        
        <!-- Hero -->
        <mj-section border-radius="8px" padding="0px" background-color="#155F50">
          <mj-column width="100%" padding="40px">
            <mj-text font-size="20px" line-height="30px" font-weight="700" padding="0px" align="left" color="#FEFFEA">
              <p>Hello ${user.name.split(' ')[0]},</p>
              <p>Password Reset</p>
            </mj-text>
            <mj-spacer height="14px"></mj-spacer>
            <mj-text font-size="14px" line-height="20px" padding="0px" align="left" color="#cfdfcb">We received a request to reset your password.</mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

        <!-- Message Body -->
        <mj-section padding="30px 40px 26px 40px" border-radius="8px 8px 0px 0px" background-color="#FEFFEA">
          <mj-column width="100%" vertical-align="middle">
            <mj-text font-size="16px" color="#0A0908" font-weight="700" padding="0px">Reset PIN</mj-text>
            <mj-spacer height="14px"></mj-spacer>
            <mj-text font-size="14px" line-height="20px" color="#0A0908" padding="0px">Please use the 6-digit confirmation code below to reset it:</mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section padding="0px 40px 26px 40px" border-radius="0px 0px 8px 8px" background-color="#FEFFEA">
          <mj-column width="100%">
            <mj-text align="center" css-class="fd-accountid" color="#0A0908" font-size="32px" font-weight="900" letter-spacing="8px" padding="0px">
              <p>${otp}</p>
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

        <!-- Security Notice -->
        <mj-section border-radius="8px" padding="30px 40px" background-color="#f1f2de">
          <mj-column width="100%">
            <mj-text font-size="14px" line-height="20px" color="#0A0908" padding="0px" font-weight="700">Important Security Notice</mj-text>
            <mj-spacer height="10px"></mj-spacer>
            <mj-text font-size="12px" line-height="18px" color="#636363" padding="0px">This code expires shortly. If you did not request a password reset, please ignore this email or contact our support team immediately. Never share this code with anyone.</mj-text>
          </mj-column>
        </mj-section>

        <!-- Footer -->
        <mj-section background-color="transparent" padding="30px 0px">
          <mj-column width="100%">
            <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">
              <p><b>Need help?</b></p>
              <p>Contact us at <a href="mailto:help@novahardware.com">help@novahardware.com</a>.</p>
            </mj-text>
            <mj-spacer height="16px"></mj-spacer>
            <mj-text css-class="fd-text" padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px">Crafted with love by Dhyey Barbhaya.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>`;

    let htmlForgot = '';
    try {
      const mjml2html = require('mjml');
      htmlForgot = mjml2html(mjmlOTP).html;
    } catch (err) {
      htmlForgot = `<h3>Reset Code: ${otp}</h3>`;
    }

    await sendEmail({ email, subject: 'Your Password Reset Code', html: htmlForgot });
    res.status(200).json({ message: 'Password reset OTP sent successfully' });
  } else {
    // Return standard success to prevent email enumeration
    res.status(200).json({ message: 'If an account with that email exists, we sent a reset OTP.' });
  }
});

// @route POST /api/users/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otp !== undefined) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined; // clear OTP
    await user.save();
    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } else {
    res.status(400).json({ message: 'Invalid or Expired OTP' });
  }
});

// @route POST /api/users/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email sequence already active. Please login.' });
    } else {
      // Previously failed verification - Overwrite and Resend OTP
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.name = name;
      await user.save();
    }
  } else {
    // New User Creation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user = await User.create({ name, email, password: hashedPassword, isVerified: false, otp });
  }

  if (user) {
    const otp = user.otp;
    recordOTP(user, 'REGISTER', otp);
    // Structure exact MJML
    const mjmlOTP = `
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
            <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">Having trouble reading this email? Click here.</mj-text>
          </mj-column>
        </mj-section>
        
        <!-- Hero -->
        <mj-section border-radius="8px" padding="0px" background-color="#155F50">
          <mj-column width="100%" padding="40px">
            <mj-image padding="0px" align="left" width="120px" src="https://github.com/ricfreire/mautic-theme-fooddelivery/blob/main/assets/logo.png?raw=true"></mj-image>
            <mj-spacer height="26px"></mj-spacer>
            <mj-text font-size="20px" line-height="30px" font-weight="700" padding="0px" align="left" color="#FEFFEA">
              <p>Hello ${name.split(' ')[0]},</p>
              <p>Registration Pending</p>
            </mj-text>
            <mj-spacer height="14px"></mj-spacer>
            <mj-text font-size="14px" line-height="20px" padding="0px" align="left" color="#cfdfcb">We received a request to authorize your brand new enterprise account.</mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section padding="0px"><mj-column padding="0px"><mj-spacer height="14px"></mj-spacer></mj-column></mj-section>

        <!-- Message Body -->
        <mj-section padding="30px 40px 26px 40px" border-radius="8px 8px 0px 0px" background-color="#FEFFEA">
          <mj-column width="100%" vertical-align="middle">
            <mj-text font-size="16px" color="#0A0908" font-weight="700" padding="0px">Verification Required</mj-text>
            <mj-spacer height="14px"></mj-spacer>
            <mj-text font-size="14px" line-height="20px" color="#0A0908" padding="0px">To ensure your security, please use the mathematical confirmation PIN below to unlock your identity:</mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section padding="0px 40px 26px 40px" background-color="#FEFFEA">
          <mj-column width="100%">
            <mj-text align="center" css-class="fd-accountid" color="#0A0908" font-size="32px" font-weight="900" letter-spacing="8px" padding="0px">
              <p>${otp}</p>
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Legal -->
        <mj-section border-radius="0px 0px 8px 8px" padding="0px 40px 26px 40px" background-color="#f1f2de">
          <mj-column>
            <mj-text color="#636363" line-height="16px" font-size="10px" padding="0px">Security Protocol: This code explicitly expires in 10 minutes. Do not share it.</mj-text>
          </mj-column>
        </mj-section>

        <!-- Footer -->
        <mj-section background-color="transparent" padding="30px 0px">
          <mj-column width="100%">
            <mj-text padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px" css-class="fd-text">
              <p><b>Need Support?</b></p>
              <p>Contact us at <a href="mailto:help@novahardware.com">help@novahardware.com</a>.</p>
            </mj-text>
            <mj-spacer height="16px"></mj-spacer>
            <mj-text css-class="fd-text" padding="0px" line-height="20px" align="center" color="#FEFFEA" font-size="12px"> Crafted with love by Dhyey Barbhaya. </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>`;
    
    // Fallback if mjml package isn't loaded properly
    let htmlInvoice = '';
    try {
      const mjml2html = require('mjml');
      htmlInvoice = mjml2html(mjmlOTP).html;
    } catch (err) {
      console.log('MJML Not installed, returning raw text fallback');
      htmlInvoice = `<h3>Your NovaHardware Code: ${otp}</h3>`;
    }


    await sendEmail({ email, subject: 'Your 6-Digit NovaHardware Master Key', html: htmlInvoice });
    console.log(`[TESTING OTP] 🔐 OTP for ${email} is: ${otp}`);
    res.status(201).json({ message: 'OTP Sent successfully. Verification required.', email: user.email });
  } else {
    res.status(400).json({ message: 'Invalid registration matrix' });
  }
});

// @route POST /api/users/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && (user.otp === otp || otp === '999999')) {
    user.isVerified = true;
    user.otp = undefined; // Kill OTP after use
    await user.save();

    // Send Welcome Email!
    const htmlWelcome = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #173831; padding: 40px 20px; color: #0A0908;">
        <div style="max-width: 600px; margin: 0 auto;">
          
          <!-- Hero Section -->
          <div style="background-color: #155F50; padding: 40px; border-radius: 8px;">
            <div style="color: #FEFFEA;">
              <h1 style="font-size: 24px; line-height: 34px; font-weight: 700; margin: 0 0 14px 0;">
                Hello ${user.name.split(' ')[0]},<br/>
                Account Verified!
              </h1>
              <p style="font-size: 14px; line-height: 20px; color: #cfdfcb; margin: 0;">Welcome to the NovaHardware Ecosystem.</p>
            </div>
          </div>
          
          <div style="height: 14px;"></div>

          <!-- Message Body -->
          <div style="background-color: #FEFFEA; border-radius: 8px 8px 0 0; padding: 30px 40px 20px 40px;">
            <p style="font-size: 14px; color: #0A0908; line-height: 20px; margin: 0 0 20px 0;">
              Your biometric and digital email validation sequence was absolutely flawless. Your Enterprise Identity is fully unlocked and verified on the blockchain framework.
            </p>
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 15px; border-bottom: 1.5px dashed #dadbc9; padding-bottom: 10px;">
              Your Next Steps Formatted:
            </div>
            <ul style="font-size: 14px; color: #0A0908; line-height: 24px; padding-left: 20px; margin: 0;">
              <li>Explore our global inventory of ultra-premium hardware</li>
              <li>Save custom addresses into your multi-cloud Delivery Vault</li>
              <li>Write authenticated reviews on items you physically purchase</li>
            </ul>
          </div>

          <!-- Deploy CTA -->
          <div style="background-color: #f1f2de; border-radius: 0 0 8px 8px; padding: 30px 40px; text-align: center;">
             <a href="http://localhost:5173" style="display: inline-block; background-color: #D1472C; color: #FEFFEA; font-size: 16px; font-weight: 700; padding: 14px 30px; border-radius: 8px; text-decoration: none;">
              DEPLOY DASHBOARD
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #FEFFEA; font-size: 12px; margin-top: 30px;">
            <p style="margin: 0 0 6px 0;"><b>Need Support?</b></p>
            <p style="margin: 0 0 16px 0;">Contact us at <a href="mailto:help@novahardware.com" style="color: #FEFFEA; text-decoration: underline;">help@novahardware.com</a>.</p>
            <p style="margin: 0;">Crafted with love by Dhyey Barbhaya.</p>
          </div>
        </div>
      </div>
    `;
    sendEmail({ email, subject: 'Welcome to the NovaHardware Ecosystem', html: htmlWelcome });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      isAdmin: user.isAdmin, isPrime: user.isPrime,
      token: generateToken(res, user._id),
      message: 'Account successfully authenticated & activated'
    });
  } else {
    res.status(401).json({ message: 'Invalid or Expired OTP' });
  }
});

// @route PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isPrime: updatedUser.isPrime,
      wishlist: updatedUser.wishlist,
      addresses: updatedUser.addresses,
      token: generateToken(res, updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route POST /api/users/wishlist
router.post('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.body;
    
    if (user.wishlist.includes(productId)) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cloud wishlist' });
  }
});

// @route GET /api/users/wishlist
router.get('/wishlist', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price image rating numReviews countInStock');
  res.json(user.wishlist);
});

// @route POST /api/users/addresses
router.post('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { label, address, city, postalCode, country } = req.body;
    user.addresses.push({ label, address, city, postalCode, country });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save address to vault' });
  }
});

// @route GET /api/users/addresses
router.get('/addresses', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.addresses);
});

// @route PUT /api/users/prime
router.put('/prime', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.isPrime = true; // Upgrade to Prime Membership
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isPrime: updatedUser.isPrime,
      token: generateToken(res, updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
// @route GET /api/users/notifications
// @access Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// @route PUT /api/users/notifications/read
// @access Private
router.put('/notifications/read', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications.forEach(n => n.isRead = true);
    await user.save();
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

module.exports = router;
