import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import { Account } from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";
import AiSupportChat from "./components/AiSupportChat";

function App() {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl font-bold text-[#E23744]">SwiftBite</span>
          <div className="h-1 w-32 rounded-full bg-[#E23744] animate-pulse" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Role-specific full-page views (no router needed — they don't use Link/navigate)
  if (user?.role === "seller")  return <Restaurant />;
  if (user?.role === "rider")   return <RiderDashboard />;
  if (user?.role === "admin")   return <Admin />;

  // Customer / unauthenticated flow — all inside BrowserRouter
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes (redirect to / if already logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/"                          element={<Home />} />
          <Route path="/restaurant/:id"            element={<RestaurantPage />} />
          <Route path="/cart"                      element={<Cart />} />
          <Route path="/checkout"                  element={<Checkout />} />
          <Route path="/orders"                    element={<Orders />} />
          <Route path="/order/:id"                 element={<OrderPage />} />
          <Route path="/address"                   element={<AddAddressPage />} />
          <Route path="/account"                   element={<Account />} />
          <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
          <Route path="/ordersuccess"              element={<OrderSuccess />} />
          <Route path="/select-role"               element={<SelectRole />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
      {user && <AiSupportChat />}
    </BrowserRouter>
  );
}

export default App;
