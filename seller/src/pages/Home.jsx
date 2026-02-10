import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Wallet,
  Cpu,
  CheckCircle2,
  BarChart3,
  Flame,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="z-10 space-y-6 md:space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm"
            >
              <Flame size={14} className="fill-current" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                Empowering 10k+ Indian Creators
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1]"
            >
              Focus on Content. <br />
              We'll handle <span className="text-primary">Payments.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              The first influencer platform that guarantees your payout. Stop
              chasing brands for invoices. Get paid automatically via our Escrow
              system.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => navigate("/seller/dashboard")}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate("/seller/earnings")}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Wallet size={20} /> View Earnings
              </button>
            </motion.div>
          </div>

          {/* Right Image Section */}
          <div className="relative mt-8 lg:mt-0 px-2 sm:px-0">
            {/* Background 3D Box - Adjusted rotation for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-indigo-600 rounded-[2rem] md:rounded-[3.5rem] -z-10 rotate-3 md:rotate-6 translate-x-3 md:translate-x-6"
            ></motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="Creator Working"
                className="w-full h-[350px] md:h-[550px] object-cover"
              />

              {/* Overlay Analytics Card - Responsive scaling */}
              <div className="absolute top-6 left-4 md:top-10 md:left-6 bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-white/50 animate-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={12} className="text-green-500" />
                  <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">
                    Revenue Growth
                  </span>
                </div>
                <p className="text-lg md:text-xl font-black text-gray-900">
                  +₹45,000
                </p>
              </div>

              {/* Payout Badge - Responsive scaling */}
              <div className="absolute bottom-6 right-4 md:bottom-10 md:right-6 bg-primary p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center gap-2 md:gap-3 border border-white/20">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold text-indigo-100 uppercase leading-none">
                    Last Payout
                  </p>
                  <p className="text-base md:text-lg font-black text-white leading-tight">
                    Instant
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS BENTO BOX --- */}
      <section className="py-16 md:py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 px-2">
              Your Business, <span className="text-primary">Secured.</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              We provide the tools. You provide the influence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Box 1: Escrow Explanation */}
            <div className="md:col-span-12 lg:col-span-8 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-xl transition-all">
              <div className="space-y-4 flex-1 text-center md:text-left">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mx-auto md:mx-0">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Zero Ghosting Policy
                </h3>
                <p className="text-sm md:text-lg text-gray-500 leading-relaxed font-medium">
                  Before you even record your first frame, the brand must
                  deposit the entire budget into InFluencaa Escrow. Once you
                  deliver, the funds unlock automatically.
                </p>
              </div>
              <div className="bg-gray-900 text-white p-6 rounded-[2rem] w-full md:w-64 space-y-4 shrink-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase">
                  Smart Contract
                </p>
                <div className="h-2 w-full bg-primary rounded-full"></div>
                <div className="h-2 w-3/4 bg-indigo-500 rounded-full"></div>
                <div className="h-2 w-1/2 bg-indigo-400 rounded-full"></div>
                <p className="text-[10px] text-indigo-300 italic pt-2">
                  Status: Funds Locked
                </p>
              </div>
            </div>

            {/* Box 2: Instant Withdrawal */}
            <div className="md:col-span-6 lg:col-span-4 bg-indigo-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
              <Wallet
                size={40}
                className="group-hover:scale-110 transition-transform mb-6"
              />
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  Instant Payouts
                </h3>
                <p className="text-indigo-100 text-xs md:text-sm font-medium">
                  No 30-day waiting periods. Withdraw your earnings the moment a
                  milestone is approved.
                </p>
              </div>
              <BarChart3
                className="absolute -right-10 -bottom-10 opacity-10"
                size={180}
              />
            </div>

            {/* Box 3: Automated Invoices */}
            <div className="md:col-span-6 lg:col-span-5 bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 text-white flex flex-col justify-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Cpu size={24} className="text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">
                  Auto-Gen Receipts
                </h3>
              </div>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                Professional PDF invoices and transaction receipts are generated
                automatically for every collab. Tax season is now a breeze.
              </p>
            </div>

            {/* Box 4: Collaboration Manager */}
            <div className="md:col-span-12 lg:col-span-7 bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between group gap-6 text-center sm:text-left">
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Collaboration Engine
                </h3>
                <p className="text-sm text-gray-500 max-w-xs font-medium">
                  Manage chats, milestones, and asset reviews in one high-speed
                  dashboard.
                </p>
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform shrink-0">
                <MousePointerClick size={24} md:size={28} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SELLER CTA --- */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gray-950 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-6xl font-black leading-tight">
              Monetize your <br className="sm:hidden" />{" "}
              <span className="text-primary">Influence</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto font-medium">
              Stop worrying about the business side. Join InFluencaa and start
              getting paid for what you love creating.
            </p>
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              Launch Your Dashboard
            </button>
          </div>

          {/* Decorative Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
