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
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm"
            >
              <Star size={16} className="fill-current" />
              <span className="text-xs font-black uppercase tracking-widest">
                India's #1 Escrow Platform for Influencers
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1]"
            >
              Collab with <span className="text-primary">Trust.</span> <br />
              Grow with <span className="text-indigo-400">Safety.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-500 max-w-lg leading-relaxed"
            >
              InFluencaa bridges the gap between brands and creators using a
              secure smart-escrow system. No more payment delays, no more
              ghosting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => {
                  clientToken ? navigate("/explore") : navigate("/login");
                }}
                className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                Explore Influencers <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                <PlayCircle size={20} /> How it works
              </button>
            </motion.div>
          </div>

          {/* Right Image Section (Floating Design) */}
          <div className="relative">
            {/* Primary Background Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-primary rounded-[3rem] -z-10 translate-x-4 translate-y-4"
            ></motion.div>

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="Influencer Collaboration"
                className="w-full h-[500px] object-cover"
              />

              {/* Floating Badge inside Image */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-none">
                      Escrow Protected
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Funds secured until delivery
                    </p>
                  </div>
                </div>
                <div className="text-primary font-black text-sm">
                  ₹ Verified
                </div>
              </div>
            </motion.div>

            {/* Extra Floating Elements */}
            <motion.div
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">50k+</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Successful Deals
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <div className="bg-gray-50/50 border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Trusted Brands", val: "1,200+" },
            { label: "Verified Creators", val: "8,500+" },
            { label: "Total Payouts", val: "₹12Cr+" },
            { label: "Safety Score", val: "99.9%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-gray-900">{stat.val}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- FEATURES (Bento Grid) --- */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-gray-900">
              Why Choose InFluencaa?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We built the ultimate infrastructure for the creator economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="md:col-span-2 bg-indigo-50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 border border-indigo-100 group hover:shadow-2xl transition-all">
              <div className="space-y-4 flex-1">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:rotate-12 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Milestone-Based Escrow
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Brands pay the full amount upfront into our secure hold.
                  Creators receive payments in stages (20% intervals) as they
                  hit campaign milestones. 100% safe for both sides.
                </p>
              </div>
              <div className="w-full md:w-64 h-48 bg-white/50 rounded-3xl border border-white flex items-center justify-center p-6">
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

            {/* Box 2 */}
            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white border border-gray-800 space-y-6 flex flex-col justify-center">
              <Users size={40} className="text-primary" />
              <h3 className="text-2xl font-bold">Verified Talent</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every creator on our platform undergoes a multi-step
                verification process to ensure real engagement and audience
                authenticity.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-primary rounded-[2.5rem] p-10 text-white space-y-6 flex flex-col justify-center relative overflow-hidden">
              <Globe size={40} className="relative z-10" />
              <h3 className="text-2xl font-bold relative z-10">
                Direct In-App Chat
              </h3>
              <p className="text-primary-100 text-sm leading-relaxed relative z-10">
                Negotiate, share briefs, and review assets directly within our
                real-time encrypted messaging system.
              </p>
              <MessageSquare
                className="absolute -right-8 -bottom-8 opacity-10 rotate-12"
                size={200}
              />
            </div>

            {/* Box 4 */}
            <div className="md:col-span-2 bg-gray-50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 border border-gray-100">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Real-Time Analytics
                </h3>
                <p className="text-gray-600">
                  Track your campaign progress, ROI, and payment history in one
                  unified dashboard.
                </p>
              </div>
              <BarChart3 size={100} className="text-primary opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-[0_30px_60px_-12px_rgba(79,70,229,0.5)]">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to scale your brand?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of brands and influencers building the future of
            marketing on InFluencaa.
          </p>
          <button
            onClick={() => {
              clientToken ? navigate("/explore") : navigate("/login");
            }}
            className="px-10 py-5 bg-white text-primary font-black rounded-2xl hover:bg-gray-50 transition-all shadow-xl"
          >
            Get Started Now
          </button>

          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
