import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Globe,
  CheckCircle2,
  PlayCircle,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../context/ClientContext";

const Home = () => {
  const navigate = useNavigate();
  const { clientToken } = useClientContext();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-12 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="z-10 space-y-6 md:space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm"
            >
              <Star size={14} className="fill-current" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                India's #1 Escrow Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight"
            >
              Collab with <span className="text-primary">Trust.</span> <br />
              Grow with <span className="text-indigo-400">Safety.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              InFluencaa bridges the gap between brands and creators using a
              secure smart-escrow system. No more payment delays or ghosting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => {
                  clientToken ? navigate("/explore") : navigate("/login");
                }}
                className=" sm:w-auto md:px-4 md:mx-8 px-2 py-2 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Explore Influencers <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>

          {/* Right Image Section */}
          <div className="relative mt-12 lg:mt-0 px-4 sm:px-0">
            {/* Primary Background Box - Slightly smaller on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-primary rounded-[2rem] md:rounded-[3rem] -z-10 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4"
            ></motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="Influencer Collaboration"
                className="w-full h-[350px] md:h-[500px] object-cover"
              />

              {/* Protected Badge - Responsive padding/text */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/50 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-black text-gray-900">
                      Escrow Protected
                    </p>
                    <p className="text-[8px] md:text-[10px] text-gray-500 font-bold">
                      Funds secured until delivery
                    </p>
                  </div>
                </div>
                <div className="text-primary font-black text-[10px] md:text-sm">
                  ₹ Verified
                </div>
              </div>
            </motion.div>

            {/* Floating Stats Badge - Hidden on very small screens */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-6 -right-2 md:-top-10 md:-right-10 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border border-gray-50 scale-75 md:scale-100"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                  <Zap size={20} md:size={24} />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-black text-gray-900 leading-none">
                    50k+
                  </p>
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase mt-1">
                    Successful Deals
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <div className="bg-gray-50/50 border-y border-gray-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
          {[
            { label: "Trusted Brands", val: "1,200+" },
            { label: "Verified Creators", val: "8,500+" },
            { label: "Total Payouts", val: "₹12Cr+" },
            { label: "Safety Score", val: "99.9%" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <p className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                {stat.val}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- FEATURES (Bento Grid) --- */}
      <section className="py-16 md:py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 px-4">
              Why Choose InFluencaa?
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto px-4 font-medium">
              We built the ultimate infrastructure for the creator economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Box 1 - Main Feature */}
            <div className="md:col-span-2 bg-indigo-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8 border border-indigo-100 group hover:shadow-2xl transition-all">
              <div className="space-y-4 flex-1 text-center lg:text-left">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm mx-auto lg:mx-0 group-hover:rotate-12 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Milestone-Based Escrow
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                  Brands pay upfront into our secure hold. Creators receive
                  payments in stages as they hit milestones. 100% safe for both
                  sides.
                </p>
              </div>
              <div className="w-full lg:w-64 h-32 md:h-48 bg-white/50 rounded-2xl md:rounded-3xl border border-white flex items-center justify-center p-4 md:p-6 shrink-0">
                <div className="space-y-3 w-full">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-4 bg-white rounded-full flex items-center px-3 gap-2"
                    >
                      <CheckCircle2 size={10} className="text-green-500" />
                      <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 2 - Talent */}
            <div className="bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white border border-gray-800 space-y-6 flex flex-col justify-center text-center md:text-left">
              <Users size={40} className="text-primary mx-auto md:mx-0" />
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold">
                  Verified Talent
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                  Every creator undergoes a multi-step verification to ensure
                  real engagement.
                </p>
              </div>
            </div>

            {/* Box 3 - Chat */}
            <div className="bg-primary rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white space-y-6 flex flex-col justify-center relative overflow-hidden group">
              <Globe size={40} className="relative z-10 mx-auto md:mx-0" />
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold">In-App Chat</h3>
                <p className="text-primary-100 text-xs md:text-sm leading-relaxed font-medium">
                  Negotiate and share briefs within our encrypted messaging
                  system.
                </p>
              </div>
              <MessageSquare
                className="absolute -right-12 -bottom-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500"
                size={200}
              />
            </div>

            {/* Box 4 - Analytics */}
            <div className="md:col-span-2 bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 border border-gray-100 group">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Real-Time Analytics
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  Track campaign progress, ROI, and payment history in one
                  unified dashboard.
                </p>
              </div>
              <BarChart3
                size={80}
                className="text-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto bg-primary rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 leading-[1.2]">
            Ready to scale your brand?
          </h2>
          <p className="text-primary-100 text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto font-bold opacity-90">
            Join thousands of brands and influencers building the future of
            marketing on InFluencaa.
          </p>
          <button
            onClick={() => {
              clientToken ? navigate("/explore") : navigate("/login");
            }}
            className="w-full sm:w-auto px-10 py-4 md:py-5 bg-white text-primary font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
          >
            Get Started Now
          </button>

          {/* Decorative background circle - hidden on small mobile to avoid overflow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 hidden sm:block"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
