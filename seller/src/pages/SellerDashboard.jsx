import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Wallet, // Changed from DollarSign for variety
  ChevronRight,
  Calendar,
  Briefcase,
  User,
  ArrowUpRight,
} from "lucide-react";
import { useSellerContext } from "../context/SellerContext";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { axios, sellerToken, sellerData } = useSellerContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingRequests: 0,
    activeJobs: 0,
    totalEarnings: 0,
  });

  // --- FETCH SELLER ORDERS ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // You'll need this endpoint in your seller routes
        const { data } = await axios.get("/api/seller/my-orders", {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });

        if (data.success) {
          setOrders(data.data);
          calculateStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sellerToken) fetchOrders();
  }, [sellerToken, axios]);

  // --- CALCULATE SELLER STATS ---
  const calculateStats = (data) => {
    const pending = data.filter((o) => o.status === "requested").length;
    const active = data.filter((o) =>
      ["active", "in_progress", "payment_pending"].includes(o.status),
    ).length;

    // Calculate earnings only from completed orders (safe logic)
    const earnings = data.reduce((acc, curr) => {
      return curr.status === "completed" ? acc + curr.totalAmount : acc;
    }, 0);

    setStats({
      totalOrders: data.length,
      pendingRequests: pending,
      activeJobs: active,
      totalEarnings: earnings,
    });
  };

  // --- STATUS BADGE HELPER ---
  const getStatusColor = (status) => {
    switch (status) {
      case "requested":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "payment_pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER & STATS --- */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Hello, {sellerData?.fullName?.split(" ")[0] || "Creator"} 🚀
          </h1>
          <p className="text-gray-500 mb-8">
            Manage your gigs, track earnings, and handle requests.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Wallet}
              label="Total Earnings"
              value={`₹${stats.totalEarnings.toLocaleString()}`}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon={ArrowUpRight}
              label="New Requests"
              value={stats.pendingRequests}
              color="bg-purple-50 text-purple-600"
              highlight={stats.pendingRequests > 0}
            />
            <StatCard
              icon={Clock}
              label="Active Jobs"
              value={stats.activeJobs}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={stats.totalOrders}
              color="bg-indigo-50 text-indigo-600"
            />
          </div>
        </div>

        {/* --- RECENT ORDERS GRID --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={20} /> Recent Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mb-6">
                Optimize your profile to attract your first client.
              </p>
              <button
                onClick={() => navigate("/seller/profile")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Update Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/seller/orders/${order._id}`)} // Route to Seller Order View
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {/* Client Avatar Placeholder */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-50">
                        {order.orderDetails?.contactPerson?.charAt(0) || "C"}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 line-clamp-1">
                          {order.orderDetails?.brandName || "Client"}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={10} />
                          <span className="truncate">
                            {order.orderDetails?.contactPerson}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize whitespace-nowrap ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 space-y-3 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Service
                        </p>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded capitalize">
                          {order.platform}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {order.serviceType}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-sm px-1">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                      <span className="font-black text-gray-900 text-lg">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center group-hover:text-indigo-600 transition-colors">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600">
                      Manage Order
                    </span>
                    <div className="p-2 rounded-full bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: STAT CARD ---
const StatCard = ({ icon: Icon, label, value, color, highlight }) => (
  <div
    className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-all duration-300 ${highlight ? "border-purple-200 ring-2 ring-purple-100" : "border-gray-100"}`}
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default SellerDashboard;
