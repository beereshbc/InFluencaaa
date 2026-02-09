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
  ExternalLink,
  History,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSellerContext } from "../context/SellerContext";

const Earnings = () => {
  const navigate = useNavigate();
  const { axios, sellerToken } = useSellerContext();
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await axios.get("/api/seller/earnings", {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });
        if (data.success) setEarningsData(data.earnings);
      } catch (error) {
        toast.error("Failed to load earnings history");
      } finally {
        setLoading(false);
      }
    };
    if (sellerToken) fetchEarnings();
  }, [sellerToken, axios]);

  const totalEarned = earningsData.reduce(
    (acc, curr) => acc + curr.amountReleased,
    0,
  );
  const inEscrow = earningsData.reduce(
    (acc, curr) => acc + (curr.sellerPayable - curr.amountReleased),
    0,
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Earnings <span className="text-indigo-600">Ledger</span>
              </h1>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                <History size={14} /> Tracking your project payouts
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Escrow Shield Active
            </span>
          </div>
        </div>

        {/* --- PRIMARY STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Total Released
              </p>
              <h2 className="text-3xl font-black text-gray-900 flex items-baseline gap-1">
                <span className="text-indigo-600 text-xl font-bold">₹</span>
                {totalEarned.toLocaleString()}
              </h2>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 size={80} className="text-indigo-600" />
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                In Escrow
              </p>
              <h2 className="text-3xl font-black text-gray-900 flex items-baseline gap-1">
                <span className="text-orange-500 text-xl font-bold">₹</span>
                {inEscrow.toLocaleString()}
              </h2>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={80} className="text-orange-600" />
            </div>
          </div>

          <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100 relative overflow-hidden text-white">
            <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">
                Active Projects
              </p>
              <h2 className="text-4xl font-black">{earningsData.length}</h2>
            </div>
            <Briefcase
              className="absolute -right-4 -bottom-4 opacity-20 rotate-12"
              size={100}
            />
          </div>
        </div>

        {/* --- TRANSACTION FEED --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
              Recent Activity
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Last 30 Days
            </span>
          </div>

          {earningsData.length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">
                No payout history found yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {earningsData.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedReceipt(item)}
                  className="group bg-white p-5 rounded-[1.5rem] border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">
                        {item.orderId.orderDetails.brandName}
                      </h4>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <span className="capitalize">
                          {item.orderId.platform}
                        </span>{" "}
                        • <Calendar size={14} />{" "}
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Released
                      </p>
                      <p className="text-xl font-black text-gray-900">
                        ₹{item.amountReleased.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 group-hover:bg-indigo-50 rounded-xl transition-colors">
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- RECEIPT MODAL --- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">
                  Payment Receipt
                </span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center pb-6 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Total Payout Amount
                </p>
                <h3 className="text-5xl font-black text-gray-900">
                  ₹{selectedReceipt.amountReleased.toLocaleString()}
                </h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-[10px] px-4 py-1.5 bg-green-100 text-green-700 rounded-full font-black uppercase tracking-widest">
                    Verified Transaction
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                    Payment ID
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-600 select-all">
                    {selectedReceipt.razorpayPaymentId || "PENDING_SYNC"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                    Service Type
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedReceipt.orderId.serviceType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                    Platform Fee
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    -₹{selectedReceipt.platformFee.toLocaleString()} (10%)
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                  <span className="text-base text-gray-900 font-black">
                    Net Received
                  </span>
                  <span className="text-xl font-black text-indigo-600">
                    ₹{selectedReceipt.sellerPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50 p-5 rounded-3xl flex items-center gap-4 border border-indigo-100">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900 uppercase tracking-tighter leading-none mb-1">
                    Automatic Settlement
                  </p>
                  <p className="text-xs text-indigo-600 font-medium">
                    Funds transferred directly via RazorpayX.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8 pt-2">
              <button
                onClick={() =>
                  navigate(`/seller/orders/${selectedReceipt.orderId._id}`)
                }
                className="w-full py-4 bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
              >
                Review Contract Details{" "}
                <ArrowUpRight
                  size={18}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
