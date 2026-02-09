import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Home as HomeIcon,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useClientContext } from "../context/ClientContext";

const Navbar = () => {
  const { setClientToken, navigate, clientData } = useClientContext();
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
    { path: "/explore", label: "Explore", icon: Search },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    setClientToken("");
    localStorage.removeItem("clientToken");
    navigate("/login");
  };

  return (
    <>
      <div className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
        <nav className="flex items-center justify-between w-full max-w-6xl bg-white/80 backdrop-blur-md border border-gray-100 p-2 rounded-full shadow-lg">
          {/* LOGO SECTION */}
          <Link to="/" className="flex items-center gap-3 pl-2 group">
            <div className="w-10 h-10 rounded-full   group-hover:scale-105 transition-transform">
              <img
                src="/in.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-gray-800 text-xs md:text-sm tracking-tight leading-none uppercase">
                INFLUENCAA
              </span>
              {clientData?.brandName && (
                <span className="text-[10px] text-primary font-bold uppercase truncate max-w-[80px]">
                  {clientData.brandName}
                </span>
              )}
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-full relative">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className="relative px-4 py-2.5 rounded-full transition-colors duration-300"
              >
                {({ isActive }) => (
                  <div className="flex items-center px-2 py-1 gap-2 relative z-10">
                    <link.icon
                      size={18}
                      className={isActive ? "text-primary" : "text-gray-400"}
                    />
                    <span
                      className={`text-sm hidden lg:block ${isActive ? "text-primary font-bold" : "text-gray-500"}`}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="clientActivePill"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full -z-10"
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
          <div className="relative pr-1" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary/40 transition-all overflow-hidden flex items-center justify-center bg-gray-100 shadow-sm"
            >
              <img
                src={
                  clientData?.thumbnail ||
                  "https://api.dicebear.com/8.x/avataaars/svg?seed=Beereshkumarb"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-12 md:top-14 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 min-w-[200px]"
                >
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400 font-medium">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {clientData?.name || "Client"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <UserIcon size={16} className="text-gray-400" /> Brand
                    Settings
                  </button>
                  <div className="h-px bg-gray-100 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors"
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
