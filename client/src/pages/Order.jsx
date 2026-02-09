import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Lock,
  Flag,
  CreditCard,
  Paperclip,
  Layout,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { useClientContext } from "../context/ClientContext";

const ENDPOINT = "http://localhost:5000";
var socket;

const Order = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, clientToken, clientData } = useClientContext();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatScrollRef = useRef(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/client/order/${id}`, {
          headers: { Authorization: `Bearer ${clientToken}` },
        });
        if (data.success) {
          setOrder(data.order);
          setPayment(data.payment);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load order details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (clientToken) fetchData();
  }, [id, clientToken, navigate, axios]);

  // --- 2. SOCKET.IO CONNECTION ---
  useEffect(() => {
    if (!clientData || !id) return;

    socket = io(ENDPOINT);
    socket.emit("join_chat", { orderId: id, userId: clientData._id });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [id, clientData]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. RAZORPAY PAYMENT LOGIC ---
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Check internet.");
      return;
    }

    try {
      // Step A: Initiate Payment on Backend
      const { data: initData } = await axios.post(
        "/api/client/payment/initiate",
        { orderId: id },
        { headers: { Authorization: `Bearer ${clientToken}` } },
      );

      if (!initData.success) {
        toast.error(initData.message || "Initialization failed");
        return;
      }

      // Step B: Open Razorpay Modal using Backend Data
      const options = {
        key: initData.key_id, // Key from backend response
        amount: initData.order.amount,
        currency: initData.order.currency,
        name: "BlueCarbon Escrow",
        description: `Order #${id.slice(-6)} Payment`,
        order_id: initData.order.id, // Razorpay Order ID from backend response

        handler: async (response) => {
          try {
            // Step C: Verify Payment on Backend
            const { data: verifyData } = await axios.post(
              "/api/client/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: id,
              },
              { headers: { Authorization: `Bearer ${clientToken}` } },
            );

            if (verifyData.success) {
              toast.success("Payment Successful! Order is now Active.");
              window.location.reload(); // Reload to show Milestones
            } else {
              toast.error("Payment verification failed on server.");
            }
          } catch (err) {
            console.error(err);
            toast.error("Verification error.");
          }
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        toast.error(response.error.description || "Payment Failed");
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
    }
  };

  // --- HANDLERS ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgData = {
      orderId: id,
      senderId: clientData._id,
      senderName: clientData.name,
      text: newMessage,
      timestamp: new Date(),
    };
    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
  };

  const handleApproveMilestone = async (milestoneStep) => {
    if (
      !window.confirm(
        `Release Milestone ${milestoneStep}? Funds will be transferred to the seller.`,
      )
    )
      return;
    try {
      const { data } = await axios.post(
        "/api/client/payment/release-milestone",
        { paymentId: payment._id, milestoneStep },
        { headers: { Authorization: `Bearer ${clientToken}` } },
      );
      if (data.success) {
        toast.success("Funds Released Successfully!");
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Release failed");
    }
  };

  const handleRefundRequest = () => {
    const reason = prompt("Enter reason for cancellation:");
    if (reason) toast.success("Refund request submitted to Admin.");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "payment_pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
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
                Seller:{" "}
                <span className="font-medium text-gray-900">
                  {order.sellerName}
                </span>{" "}
                • Platform:{" "}
                <span className="capitalize font-medium text-indigo-600">
                  {order.platform}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {order.status === "active" && (
              <button
                onClick={handleRefundRequest}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <Flag size={16} /> Cancel
              </button>
            )}
            <button className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 flex items-center gap-2">
              <ShieldCheck size={16} /> Support
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COL: ALL DETAILS & CHAT --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Full Contract Details */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
              {/* Service Info */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Briefcase size={20} className="text-indigo-600" /> Service
                  Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-gray-400 text-xs font-bold uppercase mb-1">
                      Service Type
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      {order.serviceType}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-gray-400 text-xs font-bold uppercase mb-1">
                      Total Budget
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-medium mb-1">
                      Timeline
                    </span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <Clock size={14} /> {order.serviceDetails.timeline}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-medium mb-1">
                      Revisions Included
                    </span>
                    <span className="font-bold text-gray-900">
                      {order.serviceDetails.revisions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Brief */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <FileText size={20} className="text-indigo-600" /> Campaign
                  Brief
                </h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">
                        Brand Name
                      </span>
                      {order.orderDetails.brandName}
                    </div>
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">
                        Contact Person
                      </span>
                      {order.orderDetails.contactPerson}
                    </div>
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">
                        Email
                      </span>
                      <a
                        href={`mailto:${order.orderDetails.email}`}
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Mail size={14} /> {order.orderDetails.email}
                      </a>
                    </div>
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">
                        Phone
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {order.orderDetails.phone}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <span className="block text-gray-900 font-bold mb-2">
                      Campaign Goal
                    </span>
                    <p className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {order.orderDetails.campaignGoals}
                    </p>
                  </div>

                  <div>
                    <span className="block text-gray-900 font-bold mb-2">
                      Detailed Brief
                    </span>
                    <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                      {order.orderDetails.campaignBrief}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">
                        Target Audience
                      </span>
                      <p>{order.orderDetails.targetAudience}</p>
                    </div>
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">
                        Content Guidelines
                      </span>
                      <p>
                        {order.orderDetails.contentGuidelines ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>

                  {order.orderDetails.specialRequirements && (
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-xs">
                      <span className="font-bold block mb-1">
                        Special Requirements:
                      </span>
                      {order.orderDetails.specialRequirements}
                    </div>
                  )}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <CheckCircle2 size={20} className="text-indigo-600" />{" "}
                  Expected Deliverables
                </h2>
                <ul className="grid grid-cols-1 gap-2 text-sm">
                  {order.serviceDetails.deliverables.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <Layout
                        size={16}
                        className="text-indigo-500 mt-0.5 shrink-0"
                      />
                      <span className="text-gray-700 font-medium">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Chat Interface */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {order.sellerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {order.sellerName}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Start conversation</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === clientData._id;
                    return (
                      <div
                        key={index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm"}`}
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
                  })
                )}
                <div ref={chatScrollRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-gray-200 flex gap-3"
              >
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
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

          {/* --- RIGHT COL: FINANCIALS & PAYMENT LOGIC --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status: Waiting for Seller */}
            {order.status === "requested" && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                <Clock className="mx-auto text-orange-500 mb-3" size={40} />
                <h3 className="text-lg font-bold text-gray-900">
                  Waiting for Acceptance
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  The seller must review and accept your brief before you can
                  make a payment.
                </p>
              </div>
            )}

            {/* Status: Ready to Pay */}
            {order.status === "payment_pending" && (
              <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard size={100} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Order Accepted!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {order.sellerName} is ready to start.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-gray-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <ShieldCheck size={12} /> 100% Safe Escrow
                  </p>
                </div>
                <button
                  onClick={handlePayment}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Pay Now <CreditCard size={18} />
                </button>
              </div>
            )}

            {/* Status: Active (Escrow & Milestones) */}
            {payment && (
              <div className="space-y-6">
                <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <ShieldCheck size={120} />
                  </div>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                    Total Escrow Amount
                  </p>
                  <h2 className="text-4xl font-black mb-6">
                    ₹{payment.totalAmount.toLocaleString()}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-[10px] text-indigo-200 uppercase">
                        Released
                      </p>
                      <p className="text-lg font-bold">
                        ₹{payment.amountReleased.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-[10px] text-indigo-200 uppercase">
                        Remaining
                      </p>
                      <p className="text-lg font-bold">
                        ₹{payment.amountInEscrow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign size={18} className="text-green-600" />{" "}
                      Payment Milestones
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Funds are released only upon your approval.
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {payment.milestones.map((ms) => {
                      const isReleased = ms.status === "released";
                      const isPending = ms.status === "pending_approval";
                      return (
                        <div
                          key={ms.step}
                          className="p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isReleased ? "bg-green-100 text-green-600" : isPending ? "bg-orange-100 text-orange-600 animate-pulse" : "bg-gray-100 text-gray-400"}`}
                              >
                                {isReleased ? (
                                  <CheckCircle2 size={16} />
                                ) : (
                                  ms.step
                                )}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-bold ${ms.status === "locked" ? "text-gray-400" : "text-gray-900"}`}
                                >
                                  {ms.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  20% • ₹{ms.amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pl-11 mt-3">
                            {isReleased ? (
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Paid on{" "}
                                {new Date(ms.releasedAt).toLocaleDateString()}
                              </span>
                            ) : isPending ? (
                              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                <p className="text-xs text-orange-800 mb-2 font-medium">
                                  Seller requested release.
                                </p>
                                <button
                                  onClick={() =>
                                    handleApproveMilestone(ms.step)
                                  }
                                  className="w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                                >
                                  Approve & Release ₹{ms.amount}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <Lock size={12} /> Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
