# 🍔 SwiftBite — Microservices Food Delivery Platform

A full-stack, **microservices-based food delivery application** with real-time order tracking, live rider maps, sound notifications, dual payment gateways, and an event-driven architecture.

[![Live Demo](https://img.shields.io/badge/Live-Demo-E23744?style=for-the-badge)](https://swift-bits.vercel.app)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

---

## 🔗 Live Demo

🌐 **[https://swift-bits.vercel.app](https://swift-bits.vercel.app)**

Sign in with Google, then pick a role — **Customer**, **Seller**, or **Rider** — to experience the full delivery loop: order food, accept it as a restaurant, dispatch it to a nearby rider, and watch the **live map** track the delivery in real time. 🔊 Turn your sound on to hear order notifications.

---

## ✨ Overview

**SwiftBite** is a production-style food delivery platform built on a **microservices architecture**. Instead of one monolith, the backend is split into **six independent Express + TypeScript services**, each owning a single responsibility and communicating over **HTTP** and an asynchronous **RabbitMQ** message queue. The frontend is a modern **React 19 + Vite** application with a polished, fully responsive UI.

The standout features are **real-time order tracking** with live rider geolocation rendered on **Leaflet maps**, an **event-driven rider dispatch** system that notifies nearby riders the moment an order is ready, and **dual payment gateways** (Razorpay + Stripe).

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────┐
                          │     React 19 + Vite Frontend │
                          │   (Vercel · TypeScript · TW) │
                          └──────────────┬──────────────┘
                                         │  Axios + JWT  ·  Socket.io (WS)
   ┌──────────────┬──────────────┬───────┼────────┬──────────────┬──────────────┐
   ▼              ▼              ▼        ▼        ▼              ▼              ▼
┌────────┐  ┌────────────┐  ┌────────┐ ┌───────┐ ┌──────────┐ ┌────────┐
│  Auth  │  │ Restaurant │  │ Rider  │ │ Utils │ │ Realtime │ │ Admin  │
│ :7010  │  │   :7011    │  │ :7015  │ │ :7012 │ │  :7014   │ │ :7016  │
│ OAuth  │  │ Orders     │  │ Dispatch│ │Payments│ │ Socket.io│ │ Verify │
│ JWT    │  │ Cart·Menu  │  │ GeoQuery│ │Cloudin.│ │ Gateway  │ │ Panel  │
│ MongoDB│  │ MongoDB    │  │ MongoDB │ │Razor/St│ │          │ │ MongoDB│
└────────┘  └─────┬──────┘  └───▲────┘ └───────┘ └────▲─────┘ └────────┘
                  │              │                     │
                  │   RabbitMQ "order_ready_queue"     │
                  └──── publish ──────► consume ───────┘
                  │                                     │
                  │   RabbitMQ "payment_event"          │  Socket emits
                  └──── publish ──────► consume ────────┘  (order:update,
                                                            rider:location)
```

### How it fits together
- The **Restaurant Service** owns orders. When a seller marks an order **ready for pickup**, it publishes to the `order_ready_queue`.
- The **Rider Service** consumes that message, runs a **geospatial query** to find available riders within 500 m of the restaurant, and notifies them in real time.
- The **Utils Service** verifies payments (Razorpay/Stripe) and publishes a `payment_event`; the Restaurant Service consumes it to mark the order **paid** and emit a live update.
- The **Realtime Service** is a Socket.io gateway — every service can POST an internal `emit` event (secured by an internal key) that gets pushed to the right user/restaurant room.
- **Authentication is stateless JWT**: the Auth Service issues a token after Google login; every protected route across all services verifies it with shared middleware.

---

## 🧩 Microservices & APIs

### 1️⃣ Auth Service — Authentication & Roles
**Stack:** Express · MongoDB (Mongoose) · Google OAuth (`googleapis`) · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | – | Exchange Google OAuth code → user + JWT |
| PUT  | `/api/auth/add/role` | ✅ | Set role: `customer` / `seller` / `rider` |
| GET  | `/api/auth/me` | ✅ | Get the currently logged-in user |

### 2️⃣ Restaurant Service — Restaurants, Menu, Cart & Orders
**Stack:** Express · MongoDB · Multer · RabbitMQ (publisher + consumer) · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/restaurant/new` | ✅ Seller | Create a restaurant (image → Cloudinary) |
| GET  | `/api/restaurant/my` | ✅ Seller | Get the seller's own restaurant |
| PUT  | `/api/restaurant/status` | ✅ Seller | Toggle open / closed |
| PUT  | `/api/restaurant/edit` | ✅ Seller | Edit name & description |
| GET  | `/api/restaurant/all` | ✅ | Nearby restaurants (geo + search) |
| GET  | `/api/restaurant/:id` | ✅ | Single restaurant |
| POST | `/api/item/new` | ✅ Seller | Add a menu item |
| GET  | `/api/item/all/:id` | ✅ | List a restaurant's menu |
| DELETE | `/api/item/:itemId` | ✅ Seller | Delete a menu item |
| PUT  | `/api/item/status/:itemId` | ✅ Seller | Toggle item availability |
| POST | `/api/cart/add` | ✅ | Add item to cart |
| GET  | `/api/cart/all` | ✅ | Get cart with totals |
| PUT  | `/api/cart/inc` · `/dec` | ✅ | Increment / decrement quantity |
| DELETE | `/api/cart/clear` | ✅ | Clear the cart |
| POST | `/api/address/new` | ✅ | Add a delivery address |
| GET  | `/api/address/all` | ✅ | List saved addresses |
| POST | `/api/order/new` | ✅ | Create an order |
| GET  | `/api/order/my` | ✅ | Customer's orders |
| GET  | `/api/order/restaurant/:id` | ✅ Seller | Restaurant's incoming orders |
| PUT  | `/api/order/:orderId` | ✅ Seller | Advance order status (→ ready for rider) |

### 3️⃣ Rider Service — Dispatch & Delivery
**Stack:** Express · MongoDB (2dsphere geo-index) · RabbitMQ (consumer) · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rider/new` | ✅ | Create rider profile (KYC + photo) |
| GET  | `/api/rider/myprofile` | ✅ | Get rider profile |
| PATCH | `/api/rider/toggle` | ✅ | Go online / offline (+ live location) |
| POST | `/api/rider/accept/:orderId` | ✅ | Accept an incoming delivery |
| GET  | `/api/rider/order/current` | ✅ | Current active delivery |
| PUT  | `/api/rider/order/update/:orderId` | ✅ | Update status (picked-up → delivered) |

### 4️⃣ Utils Service — Payments & Media
**Stack:** Express · Razorpay · Stripe · Cloudinary · RabbitMQ (publisher)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create` | – | Create a Razorpay order |
| POST | `/api/payment/verify` | – | Verify Razorpay signature → publish `payment_event` |
| POST | `/api/payment/stripe/create` | – | Create a Stripe checkout session |
| POST | `/api/payment/stripe/verify` | – | Verify Stripe session → publish `payment_event` |
| POST | `/api/upload` | 🔒 internal | Upload image buffer to Cloudinary |

### 5️⃣ Realtime Service — Socket.io Gateway
**Stack:** Express · Socket.io · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/internal/emit` | 🔒 internal-key | Emit an event to a user/restaurant room |

Socket events: `order:new`, `order:update`, `order:rider_assigned`, `order:available`, `rider:location`.

### 6️⃣ Admin Service — Verification Panel
**Stack:** Express · MongoDB (native driver) · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/v1/admin/restaurant/pending` | ✅ Admin | List unverified restaurants |
| GET  | `/api/v1/admin/rider/pending` | ✅ Admin | List unverified riders |
| PATCH | `/api/v1/verify/restaurant/:id` | ✅ Admin | Verify a restaurant |
| PATCH | `/api/v1/verify/rider/:id` | ✅ Admin | Verify a rider |

---

## 🛠️ Tech Stack & Services

### Frontend
| Tech | Purpose |
|------|---------|
| **React 19 + Vite** | UI framework & lightning-fast build |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing & guards |
| **Leaflet + React-Leaflet** | Live delivery maps & routing |
| **Socket.io-client** | Real-time order & location updates |
| **@react-oauth/google** | Google sign-in flow |
| **Stripe.js** · **Razorpay** | Checkout & payments |
| **Axios · react-hot-toast · react-icons** | API calls, toasts, icons |

### Backend & Infrastructure — *the "which service does what" map*
| Service / Tool | Role in the app |
|----------------|-----------------|
| **Node.js + Express 5 (×6)** | Independent microservices |
| **MongoDB / Mongoose** | Users, restaurants, menu, cart, orders, riders |
| **RabbitMQ** | Event-driven rider dispatch & payment events |
| **Socket.io** | Real-time order status & live rider location |
| **Google OAuth 2.0** | Passwordless authentication |
| **Razorpay + Stripe** | Dual payment gateways |
| **Cloudinary** | Image hosting for restaurants, menu & rider KYC |
| **JWT** | Stateless auth shared across all services |
| **2dsphere geo-index** | Find riders within 500 m of a restaurant |
| **Docker** | Each service is containerized (Dockerfile per service) |

---

## 🚀 Deployment

| Component | Platform |
|-----------|----------|
| **Frontend (React/Vite)** | **Vercel** |
| **Auth Service** | **Render** — separate Docker web service |
| **Restaurant Service** | **Render** — separate Docker web service |
| **Rider Service** | **Render** — separate Docker web service |
| **Utils Service** | **Render** — separate Docker web service |
| **Realtime Service** | **Render** — separate Docker web service |
| **Admin Service** | **Render** — separate Docker web service |
| **RabbitMQ (message broker)** | Self-hosted on an **AWS EC2** instance |
| **MongoDB** | **MongoDB Atlas** |

Each backend microservice is **containerized with Docker** (every service ships its own multi-stage `Dockerfile`) and deployed independently on **Render**. The frontend is hosted on **Vercel**, and **RabbitMQ runs on a dedicated AWS EC2 server** that all services connect to for event-driven dispatch and cache/payment events.

---

## 🚀 Features

- 🔐 **Google OAuth login** — passwordless, secure, JWT-backed sessions.
- 👥 **Role-based access** — Customer, Seller, Rider, and Admin flows.
- 🍽️ **Restaurant & menu management** with Cloudinary image uploads.
- 🛒 **Smart cart** — enforces single-restaurant ordering per cart.
- 💳 **Dual payments** — Razorpay & Stripe checkout.
- 🛵 **Event-driven rider dispatch** — nearby riders (within 500 m) are notified the instant an order is ready, via RabbitMQ + geospatial queries.
- 🗺️ **Real-time order tracking** — live rider location streamed onto a Leaflet map with route drawing.
- 🔊 **Sound notifications** — distinct sounds for new orders, acceptance, and delivery.
- 📡 **Real-time updates** over Socket.io across customers, restaurants & riders.
- 🛠️ **Admin dashboard** to verify pending restaurants and riders.
- 📱 **Fully responsive UI** with a consistent brand theme.
- 🐳 **Dockerized microservices** deployed independently on Render.

---

<<<<<<< HEAD
## Photo




=======
>>>>>>> 9a106f0 (add a versal file)
## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database and a RabbitMQ broker
- Google OAuth credentials, a Cloudinary account, and Razorpay + Stripe keys

### 1. Clone the repo
```bash
git clone https://github.com/RituChoudhary01/SwiftBits.git
cd SwiftBits
```

### 2. Start RabbitMQ (local Docker)
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:management
# Management UI → http://localhost:15672  (admin / admin123)
```

### 3. Run each backend service
```bash
# In six separate terminals
cd services/auth       && npm install && npm run dev
cd services/restaurant && npm install && npm run dev
cd services/rider      && npm install && npm run dev
cd services/utils      && npm install && npm run dev
cd services/realtime   && npm install && npm run dev
cd services/admin      && npm install && npm run dev
```

### 4. Run the frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` in each service folder and `frontend/.env`:

- `services/auth/.env` — `PORT, MONGODB_URI, JWT_SEC, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET`
- `services/restaurant/.env` — `PORT, MONGODB_URI, JWT_SEC, UTILS_SERVICE, REALTIME_SERVICE, INTERNAL_SERVICE_KEY, RABBITMQ_URL, PAYMENT_QUEUE, RIDER_QUEUE, ORDER_READY_QUEUE`
- `services/rider/.env` — `PORT, MONGODB_URI, JWT_SEC, UTILS_SERVICE, RESTAURANT_SERVICE, REALTIME_SERVICE, INTERNAL_SERVICE_KEY, RABBITMQ_URL, PAYMENT_QUEUE, RIDER_QUEUE, ORDER_READY_QUEUE`
- `services/utils/.env` — `PORT, Cloud_Name, Cloud_Api_Key, Cloud_Api_Secret, INTERNAL_SERVICE_KEY, RABBITMQ_URL, PAYMENT_QUEUE, RESTAURANT_SERVICE, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, STRIPE_SECRET_KEY, FRONTEND_URL`
- `services/realtime/.env` — `PORT, JWT_SEC, INTERNAL_SERVICE_KEY`
- `services/admin/.env` — `PORT, MONGODB_URI, JWT_SEC`
- `frontend/.env` — `VITE_STRIPE_PUBLISHABLE_KEY, VITE_INTERNAL_SERVICE_KEY`

---

## 📂 Project Structure

```
SwiftBits/
├── frontend/                # React 19 + Vite frontend
│   ├── public/sounds/       # Notification sound effects
│   └── src/
│       ├── components/      # Navbar, cards, maps, route guards
│       ├── context/         # AppContext + SocketContext
│       ├── hooks/useSound.ts
│       ├── pages/           # Home, Cart, Checkout, Orders, RiderDashboard, Admin…
│       └── config.ts        # Backend service base URLs
└── services/
    ├── auth/                # Google OAuth + JWT     (MongoDB)
    ├── restaurant/          # Orders·Cart·Menu       (MongoDB · RabbitMQ pub/sub)
    ├── rider/               # Dispatch & delivery     (MongoDB geo · RabbitMQ sub)
    ├── utils/               # Payments & uploads      (Razorpay · Stripe · Cloudinary)
    ├── realtime/            # Socket.io gateway
    └── admin/               # Verification panel      (MongoDB native driver)
        └── (each ships its own Dockerfile)
```

---

## 👩‍💻 Author

**Ritu Choudhary** — GitHub [@RituChoudhary01](https://github.com/RituChoudhary01)

⭐ *If you like this project, consider giving it a star on GitHub!*
