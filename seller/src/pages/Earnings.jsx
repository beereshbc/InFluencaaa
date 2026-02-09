import React, { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ChevronRight,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  FileText,
  X,
  ShieldCheck,
  Briefcase,
  CreditCard,
  ArrowUpRight,
  History,
  Lock,
  Wallet,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSellerContext } from "../context/SellerContext";
const Earnings = () => {
  const navigate = useNavigate();
  const { axios, sellerToken, sellerData } = useSellerContext();

  // Data State
  const [earningsData, setEarningsData] = useState([]);
  const [balances, setBalances] = useState({
    withdrawable: 0,
    locked: 0,
    lifetime: 0,
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // --- 1. Fetch Earnings Data ---
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await axios.get("/api/seller/earnings", {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });

        if (data.success) {
          setEarningsData(data.earnings);
          // Backend should calculate these, but we fallback to 0 if missing
          setBalances({
            withdrawable: data.stats?.availableToWithdraw || 0,
            locked: data.stats?.lockedIn48h || 0,
            lifetime: data.stats?.totalLifetimeEarnings || 0,
          });
        }
      } catch (error) {
        toast.error("Failed to sync financial data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (sellerToken) fetchEarnings();
  }, [sellerToken, axios]);

  // --- 2. Handle Withdrawal Request ---
  const handleWithdraw = async (e) => {
    e.preventDefault();

    // Validation
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 500)
      return toast.error("Minimum withdrawal is ₹500");
    if (amount > balances.withdrawable)
      return toast.error("Insufficient withdrawable balance");

    const loadingToast = toast.loading("Processing secure request...");

    try {
      const { data } = await axios.post(
        "/api/seller/withdraw",
        { amount },
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );

      if (data.success) {
        toast.success("Withdrawal Requested Successfully!", {
          id: loadingToast,
        });
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        // Optimistically update UI (subtract from withdrawable)
        setBalances((prev) => ({
          ...prev,
          withdrawable: prev.withdrawable - amount,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Transaction Failed", {
        id: loadingToast,
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-indigo-600 animate-pulse">
            Syncing Ledger...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-4 sm:px-6 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Financial Overview
              </h1>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-green-600" /> Verified
                Payouts
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Wallet size={18} />
            <span>Withdraw Funds</span>
          </button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Available */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Available Balance
              </p>
              <h2 className="text-3xl font-black text-green-600 mt-2">
                ₹{balances.withdrawable.toLocaleString()}
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 w-fit px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={14} /> Ready to Transfer
            </div>
            <Banknote className="absolute right-[-10px] bottom-[-10px] opacity-5 text-green-600 w-32 h-32" />
          </div>

          {/* Card 2: Locked (48h) */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Processing (48h Lock)
              </p>
              <h2 className="text-3xl font-black text-gray-800 mt-2">
                ₹{balances.locked.toLocaleString()}
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 w-fit px-3 py-1.5 rounded-lg">
              <Lock size={14} /> Auto-unlocks soon
            </div>
            <History className="absolute right-[-10px] bottom-[-10px] opacity-5 text-orange-600 w-32 h-32" />
          </div>

          {/* Card 3: Lifetime */}
          <div className="p-6 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
            <div>
              <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider">
                Lifetime Earnings
              </p>
              <h2 className="text-3xl font-black mt-2">
                ₹{balances.lifetime.toLocaleString()}
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/10">
              <TrendingUp size={14} /> Total Revenue
            </div>
            <Briefcase className="absolute right-[-10px] bottom-[-10px] opacity-10 w-32 h-32 rotate-12" />
          </div>
        </div>

        {/* --- TRANSACTION HISTORY --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-gray-900">
              Transaction History
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
              Recent
            </span>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50 overflow-hidden">
            {earningsData.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-medium">
                  No transactions found.
                </p>
              </div>
            ) : (
              earningsData.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedReceipt(item)}
                  className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {item.orderId.platform.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {item.orderId.orderDetails.brandName}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                        {item.orderId.serviceType} •{" "}
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{item.amountReleased.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                        Settled
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-indigo-600"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- RECEIPT MODAL --- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <span className="font-bold text-sm tracking-wide">
                  PAYMENT RECEIPT
                </span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center border-b border-gray-100 pb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Amount Credited
                </p>
                <h3 className="text-4xl font-black text-gray-900 mt-1">
                  ₹{selectedReceipt.amountReleased.toLocaleString()}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Payment ID</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {selectedReceipt.razorpayPaymentId
                      ?.slice(-8)
                      .toUpperCase() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Service</span>
                  <span className="font-bold text-gray-800">
                    {selectedReceipt.orderId.serviceType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">
                    Platform Fee
                  </span>
                  <span className="font-bold text-red-500">
                    - ₹{selectedReceipt.platformFee.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Payout</span>
                  <span className="font-black text-lg text-indigo-600">
                    ₹{selectedReceipt.sellerPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(`/seller/orders/${selectedReceipt.orderId._id}`)
                }
                className="w-full py-3.5 bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                View Contract <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- WITHDRAW MODAL --- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-0 overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs font-medium text-blue-800 leading-relaxed">
                  Funds from completed milestones are moved to your withdrawable
                  balance <strong>48 hours</strong> after release to ensure
                  safety.
                </p>
              </div>

              {/* Balance Display */}
              <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Available to Withdraw
                </p>
                <h4 className="text-3xl font-black text-gray-900 mt-1">
                  ₹{balances.withdrawable.toLocaleString()}
                </h4>
              </div>

              {/* Bank Details Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Settlement Account
                </label>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {sellerData?.bankDetails?.bankName || "Bank Account"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      XXXX-
                      {sellerData?.bankDetails?.accountNumber?.slice(-4) ||
                        "XXXX"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Enter Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min ₹500"
                    className="w-full pl-8 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-bold text-gray-900"
                  />
                  <button
                    onClick={() => setWithdrawAmount(balances.withdrawable)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount ||
                  withdrawAmount < 500 ||
                  withdrawAmount > balances.withdrawable
                }
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:shadow-none flex items-center justify-center gap-2"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
