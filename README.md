# 🖥️ NovaHardware Store

> A full-stack, enterprise-grade e-commerce platform built with the **MERN Stack** (MongoDB, Express, React, Node.js). Designed for hardware enthusiasts — featuring real-time dynamic pricing, MJML-powered transactional emails, Razorpay payment integration, PDF invoice generation, and a premium dark mode UI.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## ✨ Features

### 🛒 Customer Experience
- **Product Catalog** — Browse, search, and filter through premium hardware products
- **Product Reviews** — Authenticated users can rate and review purchased items
- **Shopping Cart** — Add/remove items with real-time quantity management
- **Checkout Flow** — Multi-step checkout with address and payment method selection
- **Order Tracking** — Real-time order status updates (Processing → Shipped → Out for Delivery → Delivered)
- **Order History** — View all past orders with detailed breakdowns
- **Returns & Refunds** — RMA engine for requesting product returns

### 🔐 Authentication & Security
- **JWT Authentication** — Secure token-based auth with HTTP-only cookies
- **OTP Email Verification** — 6-digit OTP sent via MJML-templated email on registration
- **Forgot Password** — 2-step password reset flow with email OTP verification
- **Admin Role System** — Protected admin routes and dashboard access
- **OTP Logger** — All OTP events logged with user details to `otp.txt` for auditing

### 📧 MJML Email System
All transactional emails use **MJML** (compiled server-side) for pixel-perfect, responsive designs:

| Email | Trigger |
|-------|---------|
| 📝 **Registration OTP** | User signs up |
| ✅ **Account Verified** | OTP verification success |
| 🔐 **Password Reset OTP** | Forgot password request |
| 🧾 **Order Confirmation** | New order placed (with PDF invoice attached) |
| 📦 **Order Shipped** | Admin marks order as Shipped |
| 🚚 **Out for Delivery** | Admin marks order as Out for Delivery |
| ✅ **Order Delivered** | Admin marks order as Delivered |
| 💰 **Return Approved** | Admin approves a return request |

### 💳 Payments
- **Razorpay Integration** — Seamless Indian payment gateway support
- **Stripe Integration** — International payment processing
- **PDF Invoices** — Auto-generated PDF invoices attached to confirmation emails

### 🛠️ Admin Dashboard
- **Order Management** — Update order statuses with one click (auto-sends customer email)
- **Product Management** — Add, edit, and delete products from the catalog
- **User Management** — View all registered users and their roles
- **Return Management** — Approve or reject return requests with automatic refund emails
- **AI Dynamic Pricing** — Automated price fluctuations (±2%) simulating market demand

### 🎨 UI/UX
- **Dark Mode** — Full dark/light theme toggle with system preference detection
- **Responsive Design** — Mobile-first layout with TailwindCSS
- **Framer Motion** — Smooth page transitions and micro-animations
- **Toast Notifications** — Real-time feedback with `react-hot-toast`
- **AI Chatbot** — Built-in customer support chatbot component

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool & Dev Server |
| Redux Toolkit | State Management |
| React Router v7 | Client-side Routing |
| TailwindCSS | Utility-first Styling |
| Framer Motion | Animations |
| Axios | HTTP Client |
| Lucide React | Icon Library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime Environment |
| Express 5 | Web Framework |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Nodemailer | Email Transport |
| MJML | Email Templates |
| PDFKit | Invoice Generation |
| Razorpay SDK | Payment Processing |
| Stripe SDK | Payment Processing |

---

## 📁 Project Structure

```
NovaHardware-Store/
├── frontend/                   # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Navbar.tsx       # Navigation with auth-aware logout
│       │   └── Chatbot.tsx      # AI customer support bot
│       ├── pages/
│       │   ├── Home.tsx         # Product listing & search
│       │   ├── ProductPage.tsx  # Product details & reviews
│       │   ├── Cart.tsx         # Shopping cart
│       │   ├── Checkout.tsx     # Shipping address form
│       │   ├── PlaceOrder.tsx   # Order summary & payment
│       │   ├── Login.tsx        # Authentication
│       │   ├── Register.tsx     # New account creation
│       │   ├── VerifyOTP.tsx    # OTP verification
│       │   ├── ForgotPassword.tsx # Password reset flow
│       │   ├── Profile.tsx      # User profile & order history
│       │   └── Admin.tsx        # Admin dashboard
│       ├── store/
│       │   ├── store.ts         # Redux store config
│       │   └── authSlice.ts     # Auth state management
│       └── context/
│           └── ThemeContext.tsx  # Dark mode provider
│
├── server/                     # Express.js backend
│   ├── index.js                # Server entry point
│   ├── seeder.js               # Database seeder (admin + products)
│   ├── models/
│   │   ├── User.js             # User schema (auth, OTP, notifications)
│   │   ├── Product.js          # Product schema (reviews, pricing)
│   │   └── Order.js            # Order schema (status, returns)
│   ├── routes/
│   │   ├── userRoutes.js       # Auth, OTP, password reset
│   │   ├── productRoutes.js    # CRUD, reviews
│   │   └── orderRoutes.js      # Orders, payments, status, returns
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect & admin guard
│   └── utils/
│       ├── mailer.js           # Nodemailer transport
│       └── pdfGenerator.js     # PDFKit invoice builder
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/DHYEY2703/NovaHardware-Store.git
cd NovaHardware-Store
```

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. Seed the Database
```bash
cd server
node seeder.js
```
This creates an admin account (`support@novahardware.com`) and sample products.

### 5. Run the Application
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `support@novahardware.com` |
| Password | `123456` |

---

## 📬 Email Templates Preview

All emails follow a consistent dark green (`#173831`) + cream (`#FEFFEA`) brand palette with the Inter font family, compiled from MJML for maximum email client compatibility.

| Template | Description |
|----------|-------------|
| **Registration OTP** | Dark green hero + cream OTP card with large 6-digit code |
| **Welcome** | Verification success with onboarding checklist |
| **Password Reset** | OTP card with security notice disclaimer |
| **Order Confirmation** | Full itemized receipt + delivery details + PDF attachment |
| **Status Updates** | Color-coded status (Blue/Amber/Green) with tracking CTA |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Dhyey Barbhaya**

- GitHub: [@DHYEY2703](https://github.com/DHYEY2703)
- Email: dhyeybarbhaya@gmail.com

---

<p align="center">
  <b>Crafted with ❤️ by Dhyey Barbhaya</b><br>
  <sub>NovaHardware — Premium Hardware, Delivered.</sub>
</p>
