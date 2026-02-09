import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Send,
  MessageSquare,
  ShieldCheck,
  Flag,
  CreditCard,
  Paperclip,
  Star,
  RotateCcw,
  Layout,
  Briefcase,
  Mail,
  Phone,
  Lock,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { useClientContext } from "../context/ClientContext";

const ENDPOINT = import.meta.env.VITE_ENDPOINT_URI || "http://localhost:4000";
let socket;

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

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'report', 'refund', 'review'
  const [resolutionForm, setResolutionForm] = useState({
    rating: 0,
    reason: "",
    desc: "",
  });

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
          if (data.order.chatHistory) setMessages(data.order.chatHistory);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (clientToken) fetchData();
  }, [id, clientToken, navigate, axios]);

  // --- 2. SOCKET CONNECTION ---
  useEffect(() => {
    if (!clientData || !id) return;
    socket = io(ENDPOINT, { transports: ["websocket"] });
    socket.emit("join_chat", { orderId: id, userId: clientData._id });
    socket.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg]),
    );
    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [id, clientData]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. PAYMENT LOGIC ---
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!(await loadRazorpay())) return toast.error("SDK failed to load");

    try {
      const { data: initData } = await axios.post(
        "/api/client/payment/initiate",
        { orderId: id },
        { headers: { Authorization: `Bearer ${clientToken}` } },
      );

      if (!initData.success) return toast.error(initData.message);

      const options = {
        key: initData.key_id,
        amount: initData.order.amount,
        currency: initData.order.currency,
        name: "BlueCarbon Escrow",
        description: `Order #${id.slice(-6)}`,
        order_id: initData.order.id,
        handler: async (response) => {
          try {
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
              toast.success("Payment Successful!");
              window.location.reload();
            }
          } catch (err) {
            toast.error("Verification failed");
          }
        },
        theme: { color: "#4F46E5" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => toast.error(res.error.description));
      rzp.open();
    } catch (error) {
      toast.error("Payment init failed");
    }
  };

  // --- HANDLERS ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgData = {
      orderId: id,
      senderId: clientData._id,
      senderModel: "client",
      text: newMessage,
      timestamp: new Date(),
    };
    socket.emit("send_message", msgData);
    setNewMessage("");
  };

  const handleApproveMilestone = async (milestoneStep) => {
    if (
      !window.confirm(
        `Release Milestone ${milestoneStep}? Funds will be transferred.`,
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
        toast.success("Funds Released!");
        window.location.reload();
      }
    } catch (error) {
      toast.error("Release failed");
    }
  };

  const handleSubmitResolution = async () => {
    if (!resolutionForm.desc)
      return toast.error("Please provide a description");
    if (activeModal === "review" && resolutionForm.rating === 0)
      return toast.error("Select rating");

    try {
      const { data } = await axios.post(
        "/api/client/order/resolution",
        {
          orderId: id,
          sellerId: order.sellerId,
          type:
            activeModal === "review"
              ? "review"
              : activeModal === "refund"
                ? "refund_request"
                : "report",
          rating: resolutionForm.rating,
          reasonCategory: resolutionForm.reason,
          description: resolutionForm.desc,
        },
        { headers: { Authorization: `Bearer ${clientToken}` } },
      );

      if (data.success) {
        toast.success(
          activeModal === "review" ? "Review Submitted!" : "Request Sent.",
        );
        setActiveModal(null);
        setResolutionForm({ rating: 0, reason: "", desc: "" });
      }
    } catch (error) {
      toast.error("Submission failed");
    }
  };

  // --- HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
      case "dispute_raised":
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
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{id.slice(-6)}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(order.status)}`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Seller:{" "}
                <span className="font-bold text-gray-900">
                  {order.sellerName}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {order.status === "completed" ? (
              <button
                onClick={() => setActiveModal("review")}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Star size={18} fill="black" /> Rate Seller
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveModal("report")}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Flag size={18} /> Report
                </button>
                {payment &&
                  payment.amountInEscrow > 0 &&
                  order.status === "active" && (
                    <button
                      onClick={() => setActiveModal("refund")}
                      className="px-4 py-2 bg-white border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-bold rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <RotateCcw size={18} /> Refund
                    </button>
                  )}
                <button className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl border border-indigo-100 flex items-center gap-2">
                  <ShieldCheck size={18} /> Support
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COL: DETAILS & CHAT --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Contract Details */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                <Briefcase size={20} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Campaign Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase mb-1">
                    Service Type
                  </span>
                  <span className="font-bold text-lg">{order.serviceType}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase mb-1">
                    Total Budget
                  </span>
                  <span className="font-bold text-lg">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Timeline</span>
                  <span className="font-bold flex gap-1">
                    <Clock size={16} /> {order.serviceDetails.timeline}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Revisions</span>
                  <span className="font-bold">
                    {order.serviceDetails.revisions}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="block text-gray-900 font-bold mb-2">
                  Campaign Brief
                </span>
                <p className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                  {order.orderDetails.campaignBrief}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold block mb-1">Goal:</span>{" "}
                  {order.orderDetails.campaignGoals}
                </div>
                <div>
                  <span className="font-bold block mb-1">Platform:</span>{" "}
                  <span className="capitalize">{order.platform}</span>
                </div>
                <div>
                  <span className="font-bold block mb-1">Target Audience:</span>{" "}
                  {order.orderDetails.targetAudience}
                </div>
                {order.orderDetails.specialRequirements && (
                  <div className="col-span-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-xs">
                    <strong>Note:</strong>{" "}
                    {order.orderDetails.specialRequirements}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-indigo-600" />{" "}
                  Deliverables
                </h3>
                <ul className="grid gap-2">
                  {order.serviceDetails.deliverables.map((d, i) => (
                    <li
                      key={i}
                      className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                    >
                      <Layout size={16} className="text-indigo-500 mt-0.5" />{" "}
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Chat Interface */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
              <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {order.sellerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {order.sellerName}
                    </h3>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />{" "}
                      Online
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
                {messages.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Start conversation</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderModel === "client";
                    return (
                      <div
                        key={index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-700 rounded-bl-none"}`}
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
                className="p-4 bg-white border-t border-gray-100 flex gap-3"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 transition-all outline-none"
                />
                <button
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT COL: FINANCIALS & STATUS --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card: Requested */}
            {order.status === "requested" && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                <Clock className="mx-auto text-orange-500 mb-3" size={40} />
                <h3 className="text-lg font-bold text-gray-900">
                  Waiting for Acceptance
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  The seller must accept your brief before payment.
                </p>
              </div>
            )}

            {/* Status Card: Payment Pending */}
            {order.status === "payment_pending" && (
              <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-xl relative overflow-hidden">
                <CreditCard
                  size={100}
                  className="absolute top-0 right-0 p-4 opacity-10"
                />
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
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Pay Now <CreditCard size={18} />
                </button>
              </div>
            )}

            {/* Status Card: Active (Escrow Info) */}
            {payment && (
              <div className="space-y-6">
                <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <ShieldCheck
                    size={120}
                    className="absolute top-0 right-0 p-6 opacity-10"
                  />
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                    Escrow Total
                  </p>
                  <h2 className="text-4xl font-black mb-4">
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
                    {payment.milestones.map((ms) => (
                      <div
                        key={ms.step}
                        className="p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${ms.status === "released" ? "bg-green-100 text-green-600" : ms.status === "pending_approval" ? "bg-orange-100 text-orange-600 animate-pulse" : "bg-gray-100 text-gray-400"}`}
                            >
                              {ms.status === "released" ? (
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
                          {ms.status === "released" ? (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Paid on{" "}
                              {new Date(ms.releasedAt).toLocaleDateString()}
                            </span>
                          ) : ms.status === "pending_approval" ? (
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                              <p className="text-xs text-orange-800 mb-2 font-medium">
                                Seller requested release.
                              </p>
                              <button
                                onClick={() => handleApproveMilestone(ms.step)}
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
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RESOLUTION MODAL --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div
              className={`p-6 text-white flex justify-between items-center ${activeModal === "report" ? "bg-red-600" : activeModal === "refund" ? "bg-orange-600" : "bg-yellow-500"}`}
            >
              <div className="flex items-center gap-2">
                {activeModal === "report" && <AlertTriangle size={20} />}
                {activeModal === "refund" && <RotateCcw size={20} />}
                {activeModal === "review" && <Star size={20} fill="white" />}
                <span className="font-bold text-lg capitalize">
                  {activeModal === "refund" ? "Request Refund" : activeModal}{" "}
                  Seller
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeModal === "review" && (
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setResolutionForm({ ...resolutionForm, rating: star })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          star <= resolutionForm.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
              {activeModal !== "review" && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Reason Category
                  </label>
                  <select
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
                    onChange={(e) =>
                      setResolutionForm({
                        ...resolutionForm,
                        reason: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a reason...</option>
                    <option value="incomplete_work">Incomplete Work</option>
                    <option value="poor_quality">Poor Quality</option>
                    <option value="missed_deadlines">Missed Deadlines</option>
                    <option value="rude_behavior">Rude Behavior</option>
                    <option value="scam_attempt">Suspicious Activity</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  {activeModal === "review"
                    ? "Feedback"
                    : "Detailed Explanation"}
                </label>
                <textarea
                  rows={4}
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm"
                  placeholder={
                    activeModal === "review"
                      ? "How was your experience?"
                      : "Please describe the issue..."
                  }
                  onChange={(e) =>
                    setResolutionForm({
                      ...resolutionForm,
                      desc: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              {activeModal === "report" && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <p>
                    Reports are taken seriously. False reporting may lead to
                    account suspension.
                  </p>
                </div>
              )}
              <button
                onClick={handleSubmitResolution}
                className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all ${activeModal === "report" ? "bg-red-600 hover:bg-red-700 shadow-red-100" : activeModal === "refund" ? "bg-orange-600 hover:bg-orange-700 shadow-orange-100" : "bg-black hover:bg-gray-800"}`}
              >
                Submit {activeModal === "refund" ? "Request" : activeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
