import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  ShoppingCart,
  DollarSign,
  BarChart,
  LogOut,
  User as UserIcon,
  Share2,
  Home as HomeIcon,
} from "lucide-react";
import { useSellerContext } from "../context/SellerContext";

const Navbar = () => {
  const { setSellerToken, navigate, sellerData } = useSellerContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/seller/campaigns", label: "Campaigns", icon: Megaphone },
    { path: "/seller/dashboard", label: "Dashboard", icon: ShoppingCart },
    { path: "/seller/earnings", label: "Earnings", icon: DollarSign },
    { path: "/seller/analytics", label: "Analytics", icon: BarChart },
    { path: "/seller/connect", label: "Connect", icon: Share2 },
  ];

  const handleLogout = () => {
    setSellerToken("");
    localStorage.removeItem("sellerToken");
    navigate("/login"); // Fixed to match standard auth flow
  };

  return (
    <>
      {/* --- INTEGRATED TOP NAVBAR --- */}
      <div className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-2 md:px-6">
        <nav className="flex items-center justify-between w-full max-w-7xl bg-white/80 backdrop-blur-md border border-gray-100 p-1.5 md:p-2 rounded-full shadow-lg">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-2 md:gap-3 pl-2 group shrink-0"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/in.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-black text-gray-800 text-[10px] md:text-sm tracking-tight leading-none uppercase">
                INFLUENCAA
              </span>
              <span className="text-[8px] md:text-[10px] text-primary font-bold uppercase truncate max-w-[60px] md:max-w-[80px]">
                Seller Hub
              </span>
            </div>
          </Link>

          {/* INTEGRATED NAV LINKS (Responsive: Icons on mobile, labels on large screens) */}
          <div className="flex items-center gap-0.5 md:gap-1 bg-gray-50/50 p-1 rounded-full relative overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className="relative px-2 md:px-4 py-2 md:py-2.5 rounded-full transition-all"
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-2 relative z-10">
                    <link.icon
                      size={18}
                      className={isActive ? "text-primary" : "text-gray-400"}
                    />
                    {/* Labels hidden on mobile/tablet, shown only on large screens (lg) */}
                    <span
                      className={`text-sm hidden lg:block ${isActive ? "text-primary font-bold" : "text-gray-500"}`}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="sellerActivePill"
                        className="absolute -inset-x-1 -inset-y-1 bg-primary/10 border border-primary/20 rounded-full -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.5,
                        }}
                      />
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* PROFILE SECTION */}
          <div className="relative pr-1 shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-100 transition-all overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm hover:ring-2 hover:ring-primary/20"
            >
              {sellerData?.thumbnail ? (
                <img
                  src={sellerData.thumbnail}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={18} className="text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-12 md:top-14 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 min-w-[180px] md:min-w-[200px]"
                >
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 text-left text-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold truncate">
                      {sellerData?.fullName || "Seller"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/seller/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <UserIcon size={16} className="text-gray-400" /> My Profile
                  </button>
                  <div className="h-px bg-gray-100 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
