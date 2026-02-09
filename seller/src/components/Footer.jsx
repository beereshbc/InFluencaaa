import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* --- COLUMN 1: BRAND --- */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full  group-hover:scale-105 transition-transform">
                <img
                  src="/in.png"
                  alt="InFluencaa Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter">
                INFLUENCAA
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              The ultimate escrow-powered collaboration platform for India's
              creator economy. Securing deals, one milestone at a time.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* --- COLUMN 2: FOR CREATORS --- */}
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
              For Creators
            </h4>
            <ul className="space-y-4">
              {[
                "Seller Dashboard",
                "Earnings",
                "Analytics",
                "Verified Badge",
                "Creator FAQ",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-gray-500 hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group"
                  >
                    {item}{" "}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- COLUMN 3: FOR BRANDS --- */}
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
              For Brands
            </h4>
            <ul className="space-y-4">
              {[
                "Explore Talent",
                "Brand Dashboard",
                "Escrow Safety",
                "Campaign Manager",
                "Support",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-gray-500 hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group"
                  >
                    {item}{" "}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- COLUMN 4: CONTACT --- */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
              Get in Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin size={20} className="text-primary shrink-0" />
                <span>
                  Davanagere, Karnataka
                  <br />
                  India - 577002
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={20} className="text-primary shrink-0" />
                <a
                  href="mailto:support@influencaa.com"
                  className="hover:text-primary transition-colors"
                >
                  support@influencaa.com
                </a>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={24} />
              <div>
                <p className="text-[10px] font-black text-indigo-900 uppercase leading-none mb-1">
                  Escrow Certified
                </p>
                <p className="text-[10px] text-indigo-600 font-bold tracking-tight">
                  100% Secure Payments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400">
            © {currentYear} INFLUENCAA TECHNOLOGIES PVT LTD.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
