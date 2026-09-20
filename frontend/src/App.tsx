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
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import Help from "./pages/Help";

function App() {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#fff3f2] via-white to-white">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="h-1 w-32 overflow-hidden rounded-full bg-brand/15">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Role-specific full-page views (no router needed — they don't use Link/navigate)
  if (user?.role === "seller")  return (<><Restaurant /><Footer /></>);
  if (user?.role === "rider")   return (<><RiderDashboard /><Footer /></>);
  if (user?.role === "admin")   return (<><Admin /><Footer /></>);

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
          <Route path="/help"                      element={<Help />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
      {user && <AiSupportChat />}
      {user && <Footer />}
    </BrowserRouter>
  );
}

export default App;
