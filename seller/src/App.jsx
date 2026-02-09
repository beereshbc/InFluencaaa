import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { useSellerContext } from "./context/SellerContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import Connect from "./pages/Connect";
import Campaigns from "./pages/Campaigns";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOrder from "./pages/SellerOrder";
import Earnings from "./pages/Earnings";
import Analytics from "./pages/Analytics";
import Footer from "./components/Footer";

const App = () => {
  const { sellerToken } = useSellerContext();
  return (
    <div>
      {sellerToken && <Navbar />}

      <Routes>
        {sellerToken ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/seller/profile" element={<Profile />} />
            <Route path="/seller/connect" element={<Connect />} />
            <Route path="/seller/campaigns" element={<Campaigns />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/orders/:id" element={<SellerOrder />} />
            <Route path="/seller/earnings" element={<Earnings />} />
            <Route path="/seller/analytics" element={<Analytics />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login />} />
          </>
        )}
      </Routes>

      {sellerToken && <Footer />}
    </div>
  );
};

export default App;
