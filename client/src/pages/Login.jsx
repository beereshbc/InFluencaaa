import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";
import { useClientContext } from "../context/ClientContext";
import toast from "react-hot-toast";
const Login = () => {
  const { axios, setClientToken, navigate } = useClientContext();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brandName: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Dynamic endpoint based on state
    const endpoint = isLogin ? "/api/client/login" : "/api/client/register";

    // Prepare payload based on the mode
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      // Axios instance pulled from ClientContext
      const { data } = await axios.post(endpoint, payload);

      if (data?.success) {
        // 1. Save to LocalStorage for persistence
        localStorage.setItem("clientToken", data.token);

        // 2. Update Context state
        setClientToken(data.token);

        toast.success(
          isLogin ? "Welcome back!" : "Account created successfully!",
        );

        // Redirect after success
        setTimeout(() => navigate("/"), 1500);
      } else {
        throw new Error(data?.message || "Authentication failed");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              key={isLogin ? "login-icon" : "reg-icon"}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20"
            >
              {isLogin ? (
                <Lock className="text-white" size={36} />
              ) : (
                <User className="text-white" size={36} />
              )}
            </motion.div>

            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              {isLogin ? "Client Login" : "Client Register"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin
                ? "Access your dashboard"
                : "Register your brand to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Name Field */}
                  <div className="relative group">
                    <User
                      className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>

                  {/* Brand Name Field */}
                  <div className="relative group">
                    <Briefcase
                      className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      name="brandName"
                      placeholder="Brand Name"
                      className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={formData.brandName}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="relative group">
              <Mail
                className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <Lock
                className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}{" "}
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="bg-gray-50 py-6 px-8 text-center border-t border-gray-100">
          <p className="text-gray-600">
            {isLogin ? "Need a client account?" : "Already registered?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary font-bold hover:underline underline-offset-4"
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
