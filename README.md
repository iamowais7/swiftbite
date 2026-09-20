# 🍔 SwiftBite — Microservices Food Delivery Platform

A full-stack, **microservices-based food delivery application** with real-time order tracking, live rider maps, sound notifications, dual payment gateways, AI-powered search/assistance, and an event-driven architecture.

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq-F55036?style=for-the-badge)

> **Status:** Currently runs locally only — no live/hosted deployment yet. See [Deployment](#-deployment) for the intended target setup.

---

## ✨ Overview

**SwiftBite** is a production-style food delivery platform built on a **microservices architecture**. Instead of one monolith, the backend is split into **six independent Express + TypeScript services**, each owning a single responsibility and communicating over **HTTP** and an asynchronous **RabbitMQ** message queue. The frontend is a modern **React 19 + Vite** application with a polished, fully responsive UI.

The standout features are **real-time order tracking** with live rider geolocation rendered on **Leaflet maps**, an **event-driven rider dispatch** system that notifies nearby riders the moment an order is ready, **dual payment gateways** (Razorpay + Stripe), and **AI-powered search and assistance** built on Groq-hosted LLMs.

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────┐
                          │     React 19 + Vite Frontend │
                          │        (TypeScript · TW)     │
                          └──────────────┬──────────────┘
                                         │  Axios + JWT  ·  Socket.io (WS)
   ┌──────────────┬──────────────┬───────┼────────┬──────────────┬──────────────┐
   ▼              ▼              ▼        ▼        ▼              ▼              ▼
┌────────┐  ┌────────────┐  ┌────────┐ ┌───────┐ ┌──────────┐ ┌────────┐
│  Auth  │  │ Restaurant │  │ Rider  │ │ Utils │ │ Realtime │ │ Admin  │
│ :7010  │  │   :7011    │  │ :7015  │ │ :7012 │ │  :7014   │ │ :7016  │
│ OAuth  │  │ Orders     │  │ Dispatch│ │Payments│ │ Socket.io│ │ Verify │
│ JWT    │  │ Cart·Menu  │  │ GeoQuery│ │Cloudin.│ │ Gateway  │ │ Panel  │
│        │  │ AI search  │  │         │ │        │ │          │ │        │
│ MongoDB│  │ MongoDB    │  │ MongoDB │ │Razor/St│ │          │ │ MongoDB│
└────────┘  └─────┬──────┘  └───▲────┘ └───────┘ └────▲─────┘ └────────┘
                  │              │                     │
                  │   RabbitMQ "order_ready_queue"     │
                  └──── publish ──────► consume ───────┘
                  │                                     │
                  │   RabbitMQ "payment_event"          │  Socket emits
                  └──── publish ──────► consume ────────┘  (order:new,
                                                            order:update,
                                                            order:rider_assigned,
                                                            order:available)
```

### How it fits together
- The **Restaurant Service** owns orders. When a seller marks an order **ready for pickup**, it publishes to the `order_ready_queue`.
- The **Rider Service** consumes that message, runs a **geospatial query** to find available riders within 500 m of the restaurant, and notifies them in real time.
- The **Utils Service** verifies payments (Razorpay/Stripe) and publishes a `payment_event`; the Restaurant Service consumes it to mark the order **paid**, **clear the customer's cart**, and emit a live update.
- The **Realtime Service** is a Socket.io gateway — every service can POST an internal `emit` event (secured by an internal key) that gets pushed to the right user/restaurant room.
- **Authentication is stateless JWT**: the Auth Service issues a token after Google login; every protected route across all services verifies it with shared middleware.
- The **Restaurant Service** also calls out to **Groq** (LLM API) for AI-generated menu descriptions and semantic search ranking, and to answer customer support questions grounded in real order data.

---

## 🧩 Microservices & APIs

### 1️⃣ Auth Service — Authentication & Roles
**Stack:** Express · MongoDB (Mongoose) · Google OAuth (`googleapis`) · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | – | Exchange Google OAuth code → user + JWT |
| PUT  | `/api/auth/add/role` | ✅ | Set role: `customer` / `seller` / `rider` |
| GET  | `/api/auth/me` | ✅ | Get the currently logged-in user |

### 2️⃣ Restaurant Service — Restaurants, Menu, Cart, Orders & AI
**Stack:** Express · MongoDB · Multer · RabbitMQ (publisher + consumer) · JWT · Groq

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/restaurant/new` | ✅ Seller | Create a restaurant (image → Cloudinary) |
| GET  | `/api/restaurant/my` | ✅ Seller | Get the seller's own restaurant |
| PUT  | `/api/restaurant/status` | ✅ Seller | Toggle open / closed |
| PUT  | `/api/restaurant/edit` | ✅ Seller | Edit name & description |
| GET  | `/api/restaurant/all` | ✅ | Nearby restaurants (geo + **AI semantic search** via `?search=`) |
| GET  | `/api/restaurant/:id` | ✅ | Single restaurant |
| POST | `/api/item/new` | ✅ Seller | Add a menu item |
| GET  | `/api/item/all/:id` | ✅ | List a restaurant's menu (+ **AI semantic search** via `?search=`) |
| DELETE | `/api/item/:itemId` | ✅ Seller | Delete a menu item |
| PUT  | `/api/item/status/:itemId` | ✅ Seller | Toggle item availability |
| POST | `/api/cart/add` | ✅ | Add item to cart |
| GET  | `/api/cart/all` | ✅ | Get cart with totals |
| PUT  | `/api/cart/inc` · `/dec` | ✅ | Increment / decrement quantity |
| DELETE | `/api/cart/clear` | ✅ | Clear the cart |
| POST | `/api/address/new` | ✅ | Add a delivery address |
| GET  | `/api/address/all` | ✅ | List saved addresses |
| POST | `/api/order/new` | ✅ | Create a pending order (cart is cleared later, on confirmed payment — not here) |
| GET  | `/api/order/my` | ✅ | Customer's orders |
| GET  | `/api/order/restaurant/:id` | ✅ Seller | Restaurant's incoming orders |
| PUT  | `/api/order/:orderId` | ✅ Seller | Advance order status (→ ready for rider) |
| POST | `/api/ai/menu-description` | ✅ Seller | **AI**: generate an appetizing menu item description from a name/price |
| POST | `/api/ai/chat` | ✅ | **AI**: order-support chatbot, grounded in the customer's real order data |

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
| POST | `/api/payment/create` | – | Create a Razorpay order (amount re-derived server-side from the real order) |
| POST | `/api/payment/verify` | – | Verify Razorpay signature → publish `payment_event` |
| POST | `/api/payment/stripe/create` | – | Create a Stripe checkout session |
| POST | `/api/payment/stripe/verify` | – | Verify Stripe session → publish `payment_event` |
| POST | `/api/upload` | 🔒 internal | Upload image buffer to Cloudinary |

### 5️⃣ Realtime Service — Socket.io Gateway
**Stack:** Express · Socket.io · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/internal/emit` | 🔒 internal-key | Emit an event to a user/restaurant room |

Socket events actually emitted: `order:new`, `order:update`, `order:rider_assigned`, `order:available`.

### 6️⃣ Admin Service — Verification Panel
**Stack:** Express · MongoDB (native driver) · JWT

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/v1/admin/restaurant/pending` | ✅ Admin | List unverified restaurants |
| GET  | `/api/v1/admin/rider/pending` | ✅ Admin | List unverified riders |
| PATCH | `/api/v1/verify/restaurant/:id` | ✅ Admin | Verify a restaurant |
| PATCH | `/api/v1/verify/rider/:id` | ✅ Admin | Verify a rider |

---

## 🤖 AI Features (Groq)

Three AI features are integrated into the Restaurant Service via the [Groq API](https://console.groq.com) (OpenAI-compatible, currently using `openai/gpt-oss-120b`):

1. **AI menu description generator** — on the seller's "Add Menu Item" form, a "Generate with AI" button writes an appetizing description from the item name/price.
2. **AI semantic search** — both restaurant search and in-menu item search rank results by *meaning*, not just keyword substrings (e.g. "something spicy" can surface "Peri Peri Wings" or "Andhra Biryani" even with zero literal word overlap). This replaced an earlier regex-only search that only matched restaurant names.
3. **AI order-support chatbot** — a floating chat widget (visible to logged-in customers) answers questions about a customer's real order, grounded in actual MongoDB data (status, items, total) rather than freeform guessing.

All three calls fail gracefully — if the Groq API is unreachable or `GROQ_API_KEY` isn't set, search falls back to returning unfiltered results instead of breaking the page.

---

## 🛠️ Tech Stack & Services

### Frontend
| Tech | Purpose |
|------|---------|
| **React 19 + Vite** | UI framework & lightning-fast build |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing & guards |
| **Leaflet + React-Leaflet + leaflet-routing-machine** | Live delivery maps with actual road-routed paths |
| **Socket.io-client** | Real-time order updates |
| **@react-oauth/google** | Google sign-in flow |
| **Stripe.js** · **Razorpay** | Checkout & payments |
| **Axios · react-hot-toast · react-icons** | API calls, toasts, icons |

### Backend & Infrastructure — *the "which service does what" map*
| Service / Tool | Role in the app |
|----------------|-----------------|
| **Node.js + Express 5 (×6)** | Independent microservices |
| **MongoDB / Mongoose** | Users, restaurants, menu, cart, orders, riders |
| **RabbitMQ** | Event-driven rider dispatch & payment events |
| **Socket.io** | Real-time order status updates |
| **Google OAuth 2.0** | Passwordless authentication |
| **Razorpay + Stripe** | Dual payment gateways |
| **Cloudinary** | Image hosting for restaurants, menu & rider KYC |
| **JWT** | Stateless auth shared across all services |
| **2dsphere geo-index** | Find riders within 500 m of a restaurant |
| **Groq (LLM API)** | AI menu descriptions, semantic search, order-support chat |
| **Docker** | Each service ships its own Dockerfile (not currently used for local dev — see Getting Started) |

---

## 🚀 Deployment

**Not currently deployed anywhere — this runs locally only.** The intended target setup (not yet set up) is:

| Component | Planned Platform |
|-----------|----------|
| Frontend (React/Vite) | Vercel |
| 6× backend microservices | Render (one Docker web service each) |
| MongoDB | MongoDB Atlas |
| RabbitMQ | A hosted broker (e.g. CloudAMQP) |

Each backend microservice already ships its own multi-stage `Dockerfile`, so it's ready to deploy independently once hosting is set up — Vercel alone cannot run these services, since they're long-lived Express processes holding persistent MongoDB/RabbitMQ/Socket.io connections, not stateless serverless functions.

---

## 🚀 Features

- 🔐 **Google OAuth login** — passwordless, secure, JWT-backed sessions.
- 👥 **Role-based access** — Customer, Seller, Rider, and Admin flows, enforced server-side (not just hidden in the UI).
- 🍽️ **Restaurant & menu management** with Cloudinary image uploads.
- 🤖 **AI menu description generator** — Groq-powered, one click from a bare item name to a full description.
- 🔎 **AI semantic search** — for restaurants and for menu items within a restaurant, matches on meaning rather than exact keywords.
- 💬 **AI order-support chatbot** — grounded in a customer's real order data.
- 🛒 **Smart cart** — enforces single-restaurant ordering per cart; only cleared once payment is actually confirmed (not the moment checkout starts).
- 💳 **Dual payments** — Razorpay & Stripe checkout, with order amount re-verified server-side (not trusted from the client).
- 🛵 **Event-driven rider dispatch** — nearby riders (within 500 m, real 2dsphere geo-query) are notified the instant an order is ready, via RabbitMQ.
- 🗺️ **Real-time order tracking** — live rider location on a Leaflet map with an actual road-routed path, not a straight line.
- 🔊 **Sound notifications** — distinct sounds for new orders, acceptance, and delivery.
- 📡 **Real-time updates** over Socket.io across customers, restaurants & riders.
- 🛠️ **Admin dashboard** to verify pending restaurants and riders.
- 📱 **Fully responsive UI** with a consistent brand theme.
- 🐳 **Dockerized microservices**, ready to deploy independently.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database and a RabbitMQ broker (either via Docker, or installed natively — see below)
- Google OAuth credentials, a Cloudinary account, Razorpay + Stripe keys, and a [Groq API key](https://console.groq.com) (free tier available)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd SwiftBits-main
```

### 2. Get MongoDB + RabbitMQ running

**Option A — Docker (simplest if you have Docker Desktop):**
```bash
docker run -d --name mongodb -p 27017:27017 mongo
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

**Option B — Native install (what this project was actually last set up with, on Windows without Docker):**
```powershell
winget install -e --id MongoDB.Server
winget install -e --id Erlang.ErlangOTP --version 27.3.4.13   # pin to 27.x — RabbitMQ 4.3.x does not yet support the newest Erlang/OTP 29
# Then download the RabbitMQ Windows installer from:
# https://github.com/rabbitmq/rabbitmq-server/releases
```
After installing, enable the management UI (`http://localhost:15672`, login `guest`/`guest`):
```powershell
$env:ERLANG_HOME = "C:\Program Files\Erlang OTP"
& "C:\Program Files\RabbitMQ Server\rabbitmq_server-<version>\sbin\rabbitmq-plugins.bat" enable rabbitmq_management
Restart-Service RabbitMQ
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

### 5. (Optional) Seed some real sample data
`services/restaurant/seed.mjs` inserts a handful of real Bangalore restaurants (Meghana Foods, MTR 1924, Truffles, Corner House) with real menus/prices, so there's something to browse/search locally without manually creating a seller account first:
```bash
cd services/restaurant
npm run build
node seed.mjs
```

---

## 🔑 Environment Variables

Create a `.env` in each service folder and `frontend/.env` (**never commit these** — they hold real secrets):

- `services/auth/.env` — `PORT, MONGODB_URI, JWT_SEC, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET`
- `services/restaurant/.env` — `PORT, MONGODB_URI, JWT_SEC, UTILS_SERVICE, REALTIME_SERVICE, INTERNAL_SERVICE_KEY, RABBITMQ_URL, PAYMENT_QUEUE, RIDER_QUEUE, ORDER_READY_QUEUE, GROQ_API_KEY, GROQ_MODEL`
- `services/rider/.env` — `PORT, MONGODB_URI, JWT_SEC, UTILS_SERVICE, RESTAURANT_SERVICE, REALTIME_SERVICE, INTERNAL_SERVICE_KEY, RABBITMQ_URL, PAYMENT_QUEUE, RIDER_QUEUE, ORDER_READY_QUEUE`
- `services/utils/.env` — `PORT, Cloud_Name, Cloud_Api_Key, Cloud_Api_Secret, INTERNAL_SERVICE_KEY, RABBITMQ_URL, PAYMENT_QUEUE, RESTAURANT_SERVICE, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, STRIPE_SECRET_KEY, FRONTEND_URL`
- `services/realtime/.env` — `PORT, JWT_SEC, INTERNAL_SERVICE_KEY`
- `services/admin/.env` — `PORT, MONGODB_URI, JWT_SEC`
- `frontend/.env` — `VITE_STRIPE_PUBLISHABLE_KEY, VITE_INTERNAL_SERVICE_KEY, VITE_GOOGLE_CLIENT_ID`
  - Optional, for pointing at deployed backends instead of localhost: `VITE_AUTH_SERVICE, VITE_RESTAURANT_SERVICE, VITE_UTILS_SERVICE, VITE_REALTIME_SERVICE, VITE_RIDER_SERVICE, VITE_ADMIN_SERVICE`

`JWT_SEC` and `INTERNAL_SERVICE_KEY` must be identical across every service that lists them — they're shared secrets, not per-service ones.

Get a `GROQ_API_KEY` free at [console.groq.com](https://console.groq.com) — note this is **Groq** (the fast-inference company, `api.groq.com`), a different company from xAI's "Grok" model, despite the near-identical name.

---

## 📂 Project Structure

```
SwiftBits/
├── frontend/                # React 19 + Vite frontend
│   ├── public/sounds/       # Notification sound effects
│   └── src/
│       ├── components/      # Navbar, cards, maps, route guards, AiSupportChat
│       ├── context/         # AppContext + SocketContext
│       ├── hooks/useSound.ts
│       ├── pages/           # Home, Cart, Checkout, Orders, RiderDashboard, Admin…
│       └── config.ts        # Backend service base URLs (currently set to localhost)
└── services/
    ├── auth/                # Google OAuth + JWT     (MongoDB)
    ├── restaurant/          # Orders·Cart·Menu·AI    (MongoDB · RabbitMQ pub/sub · Groq)
    │   └── seed.mjs         # Local dev seed script — real sample restaurant data
    ├── rider/               # Dispatch & delivery     (MongoDB geo · RabbitMQ sub)
    ├── utils/               # Payments & uploads      (Razorpay · Stripe · Cloudinary)
    ├── realtime/            # Socket.io gateway
    └── admin/               # Verification panel      (MongoDB native driver)
        └── (each ships its own Dockerfile)
```

---

## 🐛 Known Issues / Notes for Future Work

Kept here honestly rather than swept under the rug:

- Admin role can't be self-assigned through the UI (no "Admin" option on sign-up) — has to be set directly in MongoDB.
- Stripe payment verification checks that a checkout session exists but doesn't check `payment_status === "paid"`.
- No automated test suite yet.
- No `docker-compose.yml` to bring the whole stack up with one command (each service has its own Dockerfile, but nothing orchestrates them together locally).
- Restaurants created via `seed.mjs` aren't owned by a real seller account, so they're browsable but not manageable from a seller dashboard.

---

## 👤 Author

**Owais Khan**

⭐ *If you like this project, consider giving it a star on GitHub!*
