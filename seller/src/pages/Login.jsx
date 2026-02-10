import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useSellerContext } from "../context/SellerContext";
import toast from "react-hot-toast";

const Login = () => {
  const { axios, setSellerToken, navigate } = useSellerContext();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isLogin ? "/api/seller/login" : "/api/seller/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
        };

    try {
      const { data } = await axios.post(endpoint, payload);
      if (!data?.success) throw new Error("Authentication failed");
      localStorage.setItem("sellerToken", data.token);
      setSellerToken(data.token);
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 text-[#FF5B5B] rounded-2xl mb-6 border border-red-100 shadow-sm">
              <Sparkles size={28} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? "Creator login portal" : "Join the creator economy"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden"
                >
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 focus:border-[#FF5B5B] rounded-2xl outline-none transition-all font-semibold text-slate-800"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 focus:border-[#FF5B5B] rounded-2xl outline-none transition-all font-semibold text-slate-800"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-white/50 border border-slate-200 focus:border-[#FF5B5B] rounded-2xl outline-none transition-all font-semibold text-slate-800"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF5B5B] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#FF5B5B] hover:bg-[#E04F4F] text-white font-black text-base rounded-2xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-bold text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[#FF5B5B] hover:text-[#E04F4F] transition-colors"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
