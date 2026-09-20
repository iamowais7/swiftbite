import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSparkles,
  HiChatBubbleLeftRight,
  HiMapPin,
  HiCreditCard,
  HiShoppingCart,
  HiBuildingStorefront,
  HiBell,
  HiChevronDown,
} from "react-icons/hi2";
import { BiCycling } from "react-icons/bi";

const features = [
  {
    icon: HiSparkles,
    title: "AI-Powered Smart Search",
    description:
      "Search restaurants and menu items by what you're craving, not exact keywords — \"something spicy\" can find dishes that don't even mention the word.",
  },
  {
    icon: HiChatBubbleLeftRight,
    title: "AI Order Assistant",
    description:
      "Got a question about an order? Click the sparkle chat button in the bottom-right corner, any time, on any page.",
  },
  {
    icon: HiMapPin,
    title: "Real-Time Order Tracking",
    description:
      "Once a rider picks up your order, watch their live location move toward you on the map, along an actual road route.",
  },
  {
    icon: HiCreditCard,
    title: "Dual Payment Options",
    description:
      "Pay however you like at checkout — Razorpay and Stripe are both supported.",
  },
  {
    icon: HiShoppingCart,
    title: "Smart Cart",
    description:
      "Add items, adjust quantities, and checkout in a few taps. Your cart stays intact until your payment is actually confirmed.",
  },
  {
    icon: HiBuildingStorefront,
    title: "Sell on SwiftBite AI",
    description:
      "Own a restaurant? Switch to a Seller account to list your menu, manage incoming orders, and even generate menu descriptions with AI.",
  },
  {
    icon: BiCycling,
    title: "Deliver as a Rider",
    description:
      "Want to deliver? Go online as a Rider and get notified the instant an order near you is ready for pickup.",
  },
  {
    icon: HiBell,
    title: "Sound Notifications",
    description:
      "Distinct sounds for new orders, acceptance, and delivery — so you never miss an update, even with the tab in the background.",
  },
];

const faqs = [
  {
    q: "How does the AI search actually work?",
    a: "When you type a search, it's sent to an AI model that understands meaning, not just spelling — so it can match dishes by cuisine, mood, or ingredients even if your exact words don't appear in the name or description.",
  },
  {
    q: "How do I become a seller or rider?",
    a: "Right after you sign up, you'll be asked to pick a role — Customer, Seller, or Rider. Sellers can set up a restaurant and menu; riders can go online to receive delivery requests.",
  },
  {
    q: "What payment methods are supported?",
    a: "Both Razorpay and Stripe are supported at checkout — pick whichever you prefer.",
  },
  {
    q: "How can I track my order?",
    a: "Go to Orders from your Account menu and open the active order — you'll see a live map once a rider is assigned.",
  },
  {
    q: "Who do I contact if I need help with a specific order?",
    a: "Use the AI Support chat (the sparkle button, bottom-right of any page) — it can see your real order details and answer directly.",
  },
];

function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white px-4 py-12"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            New here? Here's what <span className="text-brand">SwiftBite AI</span> can do
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            A quick tour of the features, plus answers to the questions people ask most.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      </motion.div>

      {/* Feature grid */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)]"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="font-bold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-extrabold text-gray-900">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-gray-800">{item.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <HiChevronDown className="h-5 w-5 shrink-0 text-brand" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-gray-500">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto mt-14 max-w-3xl rounded-2xl bg-brand/5 p-6 text-center"
        >
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
            <HiChatBubbleLeftRight className="h-5 w-5 text-brand" />
            Still stuck? Click the sparkle chat button in the bottom-right corner to talk to our AI assistant.
          </p>
        </motion.div>

        {/* Meet the developer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] sm:p-8"
        >
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <img
              src="/owais.jpeg"
              alt="Owais Khan"
              className="h-24 w-24 shrink-0 rounded-full object-cover shadow-[0_4px_16px_rgba(226,55,68,0.25)] ring-4 ring-brand/10"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Meet the Developer</p>
              <h3 className="mt-1 text-xl font-extrabold text-gray-900">Owais Khan</h3>
              <p className="mt-1 text-sm text-gray-500">
                Built SwiftBite AI end-to-end — microservices backend, real-time tracking, and the AI features across this app.
              </p>
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://owaisfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              View Portfolio
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Help;
