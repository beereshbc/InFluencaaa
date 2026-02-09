import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Calendar,
  Briefcase,
  DollarSign,
  User,
} from "lucide-react";
import { useClientContext } from "../context/ClientContext";
const Dashboard = () => {
  const navigate = useNavigate();
  const { axios, clientToken, clientData } = useClientContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    spent: 0,
  });

  // --- FETCH ORDERS ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/client/my-orders", {
          headers: { Authorization: `Bearer ${clientToken}` },
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

    if (clientToken) fetchOrders();
  }, [clientToken, axios]);

  // --- CALCULATE STATS ---
  const calculateStats = (data) => {
    const active = data.filter((o) =>
      ["active", "in_progress", "payment_pending"].includes(o.status),
    ).length;
    const completed = data.filter((o) => o.status === "completed").length;
    const spent = data.reduce((acc, curr) => {
      // Only count if payment is made/active
      return ["active", "completed"].includes(curr.status)
        ? acc + curr.totalAmount
        : acc;
    }, 0);

    setStats({
      total: data.length,
      active,
      completed,
      spent,
    });
  };

  // --- STATUS BADGE HELPER ---
  const getStatusColor = (status) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
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
            Welcome back, {clientData?.name?.split(" ")[0] || "Client"} 👋
          </h1>
          <p className="text-gray-500 mb-8">
            Here is an overview of your campaigns and orders.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={stats.total}
              color="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              icon={Clock}
              label="Active"
              value={stats.active}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={stats.completed}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon={DollarSign}
              label="Total Spent"
              value={`₹${stats.spent.toLocaleString()}`}
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </div>

        {/* --- RECENT ORDERS GRID --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={20} /> Your Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mb-6">
                Start exploring creators to launch your first campaign.
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Explore Creators
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                        {order.sellerName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">
                          {order.sellerName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={10} />
                          <span className="capitalize">{order.platform}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 space-y-3 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Service
                      </p>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {order.serviceType}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-black text-gray-900 text-lg">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center group-hover:text-indigo-600 transition-colors">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600">
                      View Details
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
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
