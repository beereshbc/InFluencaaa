import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowLeft,
  DollarSign,
  Briefcase,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSellerContext } from "../context/SellerContext";

const Analytics = () => {
  const navigate = useNavigate();
  const { axios, sellerToken } = useSellerContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get("/api/seller/analytics", {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    if (sellerToken) fetchAnalytics();
  }, [sellerToken, axios]);

  if (loading || !stats)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );

  // Simplified Chart Data
  const chartData = [
    { day: "M", val: 400 },
    { day: "T", val: 300 },
    { day: "W", val: 500 },
    { day: "T", val: 200 },
    { day: "F", val: stats.totalEarnings / 100 },
    { day: "S", val: 800 },
    { day: "S", val: 700 },
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-12 px-4 sm:px-6 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* --- SIMPLE HEADER --- */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-2xl font-bold">Business Analytics</h1>
        </div>

        {/* --- STATS ROW (Plane Style) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Earnings
            </p>
            <h3 className="text-xl font-bold text-indigo-600">
              ₹{stats.totalEarnings.toLocaleString()}
            </h3>
          </div>

          <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm font-medium mb-1">In Escrow</p>
            <h3 className="text-xl font-bold text-gray-900">
              ₹{stats.pendingEscrow.toLocaleString()}
            </h3>
          </div>

          <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm font-medium mb-1">
              Active Projects
            </p>
            <h3 className="text-xl font-bold text-gray-900">
              {stats.activeOrders}
            </h3>
          </div>

          <div className="p-5 border border-gray-100 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm font-medium mb-1">Completed</p>
            <h3 className="text-xl font-bold text-green-600">
              {stats.completedOrders}
            </h3>
          </div>
        </div>

        {/* --- SINGLE LARGE CHART --- */}
        <div className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" /> Revenue
              Growth
            </h4>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Weekly Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrimary)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- PERFORMANCE MINI GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">
                {stats.totalOrders
                  ? Math.round(
                      (stats.completedOrders / stats.totalOrders) * 100,
                    )
                  : 0}
                % Completion Rate
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Based on {stats.totalOrders} total requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Top Channel: Instagram</p>
              <p className="text-xs text-gray-500 font-medium">
                Dominates{" "}
                {Math.round(
                  (stats.platformDistribution.instagram / stats.totalOrders) *
                    100,
                )}
                % of your projects
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
