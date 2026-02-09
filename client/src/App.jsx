import React from "react";
import { Toaster } from "react-hot-toast";
import { useClientContext } from "./context/ClientContext";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Explore from "./pages/Explore";
import Overview from "./pages/Overview";
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
import Footer from "./components/Footer";

const App = () => {
  const { clientToken } = useClientContext();

  return (
    <div>
      <Toaster />
      {clientToken && <Navbar />}

      <Routes>
        {clientToken ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders/:id" element={<Order />} />
            <Route path="/explore/:id" element={<Overview />} />
          </>
        ) : (
          <>
            <Route path="*" element={<Login />} />
          </>
        )}
      </Routes>
      {clientToken && <Footer />}
    </div>
  );
};

export default App;
