import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Send,
  MessageSquare,
  ShieldCheck,
  Download,
  Lock,
  Flag,
  MoreVertical,
  Paperclip,
  XCircle,
  Briefcase,
  Mail,
  Phone,
  Layout,
  Target,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { useSellerContext } from "../context/SellerContext";

const ENDPOINT = import.meta.env.VITE_ENDPOINT_URI || "http://localhost:4000";
let socket;

const SellerOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, sellerToken, sellerData } = useSellerContext();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatScrollRef = useRef(null);

  // --- 1. FETCH DATA (Full Order + Chat) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/seller/order/${id}`, {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });

        if (data.success) {
          setOrder(data.order);
          setPayment(data.payment);
          // Sync historical messages
          if (data.order.chatHistory) {
            setMessages(data.order.chatHistory);
          }
        }
      } catch (error) {
        toast.error("Failed to load order details");
        navigate("/seller/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (sellerToken) fetchData();
  }, [id, sellerToken, navigate, axios]);

  // --- 2. SOCKET CONNECTION ---
  useEffect(() => {
    if (!sellerData?._id || !id) return;

    socket = io(ENDPOINT, { transports: ["websocket"] });
    socket.emit("join_chat", { orderId: id, userId: sellerData._id });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [id, sellerData]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. HANDLERS ---
  const handleAcceptOrder = async () => {
    try {
      const { data } = await axios.put(
        `/api/seller/order/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        },
      );
      if (data.success) {
        toast.success("Order Accepted! Notifying client.");
        setOrder(data.order);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  };

  const handleRejectOrder = async () => {
    if (!window.confirm("Reject this request?")) return;
    try {
      const { data } = await axios.put(
        `/api/seller/order/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        },
      );
      if (data.success) {
        toast.success("Order Rejected");
        navigate("/seller/dashboard");
      }
    } catch (error) {
      toast.error("Error rejecting order");
    }
  };

  const handleRequestRelease = async (milestoneStep) => {
    try {
      const { data } = await axios.post(
        "/api/seller/payment/request-release",
        { paymentId: payment._id, milestoneStep },
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );
      if (data.success) {
        toast.success("Release Requested! Client must approve.");
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const msgData = {
      orderId: id,
      senderId: sellerData._id,
      senderModel: "Seller",
      text: newMessage,
    };

    socket.emit("send_message", msgData);
    setNewMessage("");
  };

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

  if (loading || !order)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900">
                  Order #{id.slice(-6)}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Client:{" "}
                <span className="font-bold text-gray-900">
                  {order.orderDetails.contactPerson}
                </span>{" "}
                • Brand:{" "}
                <span className="font-medium text-indigo-600">
                  {order.orderDetails.brandName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* --- ACTION BANNER (Accept/Reject) --- */}
        {order.status === "requested" && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-indigo-900">
                  New Order Request
                </h3>
                <p className="text-sm text-indigo-700">
                  Accept this request to enable the client to pay the escrow
                  amount.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleRejectOrder}
                className="flex-1 md:flex-none px-6 py-3 bg-white text-red-600 font-bold rounded-xl border border-gray-200 hover:bg-red-50"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptOrder}
                className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg"
              >
                Accept Order
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. COMPREHENSIVE CONTRACT BOX */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
              {/* Financial & Service Summary */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                  <Briefcase size={20} className="text-indigo-600" /> Contract
                  Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Total Budget
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Platform
                    </span>
                    <span className="text-base font-bold text-gray-900 capitalize">
                      {order.platform}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Service
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {order.serviceType}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Timeline
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {order.serviceDetails.timeline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={16} /> Client Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Brand:</span>{" "}
                      <span className="font-bold">
                        {order.orderDetails.brandName}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Contact:</span>{" "}
                      <span className="font-bold">
                        {order.orderDetails.contactPerson}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Email:</span>{" "}
                      <span className="text-indigo-600 underline">
                        {order.orderDetails.email}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="font-bold">
                        {order.orderDetails.phone}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Target size={16} /> Campaign Strategy
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Target Audience:</span>{" "}
                      <span className="font-medium block">
                        {order.orderDetails.targetAudience || "Not specified"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Goals:</span>{" "}
                      <span className="font-medium block">
                        {order.orderDetails.campaignGoals || "Not specified"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Brief & Deliverables */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Campaign Brief
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-100">
                    {order.orderDetails.campaignBrief}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Deliverables List
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.serviceDetails.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 bg-indigo-50/50 text-indigo-700 rounded-xl border border-indigo-100 text-sm font-medium"
                      >
                        <Layout size={16} /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PERSISTENT CHAT BOX */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                    {order.orderDetails.contactPerson.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {order.orderDetails.contactPerson}
                    </h3>
                    <p className="text-xs text-gray-500">Brand Client</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.map((msg, index) => {
                  const isMe = msg.senderModel === "Seller";
                  return (
                    <div
                      key={index}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-none shadow-md" : "bg-white border border-gray-200 text-gray-700 rounded-bl-none"}`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-gray-400"}`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatScrollRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t flex gap-3"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-gray-100 border-0 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT COL: FINANCIALS & MILESTONES --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Earning Card */}
            <div className="bg-green-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <DollarSign
                size={120}
                className="absolute top-0 right-0 p-6 opacity-10"
              />
              <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">
                Your Total Earnings
              </p>
              <h2 className="text-4xl font-black mb-6">
                ₹
                {(
                  payment?.sellerPayable || order.totalAmount * 0.9
                ).toLocaleString()}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-green-200 uppercase">
                    Released
                  </p>
                  <p className="text-lg font-bold">
                    ₹{payment?.amountReleased?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-green-200 uppercase">
                    In Escrow
                  </p>
                  <p className="text-lg font-bold">
                    ₹
                    {payment
                      ? (
                          payment.sellerPayable - payment.amountReleased
                        ).toLocaleString()
                      : "0"}
                  </p>
                </div>
              </div>
            </div>

            {/* Milestone Tracker */}
            {payment ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />{" "}
                    Payment Milestones
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Request release after completing each phase.
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {payment.milestones.map((ms) => {
                    const isReleased = ms.status === "released";
                    const isPending = ms.status === "pending_approval";
                    const isLocked = ms.status === "locked";
                    return (
                      <div
                        key={ms.step}
                        className="p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isReleased ? "bg-green-100 text-green-600" : isPending ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}
                          >
                            {isReleased ? <CheckCircle2 size={16} /> : ms.step}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${isLocked ? "text-gray-400" : "text-gray-900"}`}
                            >
                              {ms.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{ms.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="pl-11">
                          {isReleased ? (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                              Received{" "}
                              {new Date(ms.releasedAt).toLocaleDateString()}
                            </span>
                          ) : isPending ? (
                            <div className="bg-orange-50 p-2 rounded-lg text-center">
                              <p className="text-xs text-orange-700 font-bold animate-pulse">
                                Awaiting Client Approval
                              </p>
                            </div>
                          ) : (
                            <button
                              disabled={isLocked}
                              onClick={() => handleRequestRelease(ms.step)}
                              className={`w-full py-2 px-4 rounded-lg text-xs font-bold ${isLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"}`}
                            >
                              Mark Step as Done
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
                <Clock className="mx-auto text-gray-400 mb-2" size={40} />
                <p className="text-sm text-gray-500 font-medium">
                  {order.status === "requested"
                    ? "Accept order to see milestones"
                    : "Waiting for client payment"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrder;
