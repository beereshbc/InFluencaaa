import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  Globe,
  CheckCircle2,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Users,
  TrendingUp,
  Link,
  Zap,
  ArrowLeft,
  Briefcase,
  Languages,
  Image as ImageIcon,
  MessageCircle,
  X,
} from "lucide-react";
import { useClientContext } from "../context/ClientContext";
import BookOrder from "../components/BookOrder";

const Overview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, clientToken } = useClientContext();

  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const socialIcons = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sellerRes, reviewsRes] = await Promise.all([
          axios.get(`/api/client/seller/${id}`, {
            headers: { Authorization: `Bearer ${clientToken}` },
          }),
          axios.get(`/api/client/seller/${id}/reviews`, {
            headers: { Authorization: `Bearer ${clientToken}` },
          }),
        ]);

        if (sellerRes.data.success) {
          const s = sellerRes.data.seller;
          setSeller(s);
          if (s.campaigns?.length > 0)
            setActiveTab(s.campaigns[0].platform.toLowerCase());
        }
        if (reviewsRes.data.success) setReviews(reviewsRes.data.reviews);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (clientToken && id) fetchData();
  }, [id, clientToken, axios]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getActiveCampaign = () =>
    seller?.campaigns?.find((c) => c.platform.toLowerCase() === activeTab);
  const activeCampaign = getActiveCampaign();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#FF5B5B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700 tracking-widest uppercase">
            Loading Profile...
          </p>
        </div>
      </div>
    );

  if (!seller)
    return (
      <div className="p-20 text-center font-black text-slate-400">
        Creator Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans pb-24 text-slate-900">
      {/* --- HERO --- */}
      <div className="relative h-56 md:h-72 w-full bg-slate-900 overflow-hidden">
        {seller.coverImage ? (
          <img
            src={seller.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF5B5B] to-slate-900" />
        )}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all border border-white/30"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="flex flex-col lg:row gap-8 lg:flex-row">
          {/* --- SIDEBAR --- */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-8 sticky top-24"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative -mt-24 mb-4">
                  <div className="w-32 h-32 rounded-3xl p-1.5 bg-white shadow-lg border-2 border-slate-50">
                    <img
                      src={
                        seller.thumbnail || "https://via.placeholder.com/150"
                      }
                      alt={seller.fullName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-xl shadow-md border-2 border-slate-50 flex items-center gap-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm font-black text-slate-900">
                      {seller.rating}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                  {seller.fullName}{" "}
                  <CheckCircle2
                    size={20}
                    className="text-[#FF5B5B] fill-red-50"
                  />
                </h1>
                <span className="mt-2 px-4 py-1 bg-red-50 text-[#FF5B5B] text-xs font-bold uppercase tracking-widest rounded-lg border-2 border-red-100">
                  {seller.niche}
                </span>

                <div className="grid grid-cols-3 gap-4 w-full mt-8 pb-8 border-b-2 border-slate-50">
                  <StatBox
                    label="Reach"
                    value={formatNumber(seller.audience)}
                  />
                  <StatBox
                    label="Reviews"
                    value={seller.totalReviews || 0}
                    border
                  />
                  <StatBox
                    label="Engage"
                    value={`${seller.avgEngagementRate || 0}%`}
                  />
                </div>

                <div className="w-full space-y-4 mt-8">
                  <InfoRow
                    icon={MapPin}
                    label="Location"
                    value={seller.location}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Avg. Response"
                    value={seller.responseTime}
                  />
                  <InfoRow
                    icon={Languages}
                    label="Language"
                    value={seller.languages?.join(", ") || "English"}
                  />
                </div>

                <div className="w-full mt-8">
                  <button
                    onClick={handleShare}
                    className="w-full py-4 bg-[#FF5B5B] hover:bg-[#E04F4F] text-white rounded-2xl font-black text-base shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-3"
                  >
                    <Link size={18} />{" "}
                    {copied ? "Copied Link!" : "Share Profile"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="w-full lg:flex-1 space-y-10">
            {/* Bio */}
            <section className="bg-slate-50/50 rounded-3xl p-8 border-2 border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#FF5B5B] rounded-full" /> About
                the Creator
              </h3>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                {seller.bio || "This creator hasn't written a bio yet."}
              </p>
            </section>

            {/* Platform & Packages */}
            {seller.campaigns?.length > 0 && (
              <div className="space-y-8">
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar border-b-2 border-slate-100">
                  {seller.campaigns.map((camp) => {
                    const pKey = camp.platform.toLowerCase();
                    const Icon = socialIcons[pKey] || Globe;
                    const isActive = activeTab === pKey;
                    return (
                      <button
                        key={pKey}
                        onClick={() => setActiveTab(pKey)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all border-b-4 ${isActive ? "border-[#FF5B5B] text-[#FF5B5B] bg-red-50/50" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                      >
                        <Icon size={18} /> {camp.platform}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {activeCampaign && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <PlatformStatCard
                          label="Followers"
                          value={formatNumber(activeCampaign.followers)}
                          icon={<Users size={20} />}
                        />
                        <PlatformStatCard
                          label="Engagement"
                          value={`${activeCampaign.engagementRate}%`}
                          icon={<TrendingUp size={20} />}
                          highlight
                        />
                        <PlatformStatCard
                          label="Handle"
                          value={`@${activeCampaign.username}`}
                          icon={<Globe size={20} />}
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-[#FF5B5B] rounded-xl border border-red-100">
                            <Briefcase size={20} />
                          </div>
                          Collaboration Packages
                        </h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {activeCampaign.packages?.map((pkg, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-[#FF5B5B] transition-all duration-300 shadow-sm flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start mb-6">
                                  <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    {pkg.serviceType}
                                  </span>
                                  <span className="text-3xl font-black text-slate-900">
                                    ₹{pkg.amount.toLocaleString()}
                                  </span>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-3">
                                  {pkg.name}
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                                  {pkg.description}
                                </p>

                                <div className="space-y-3 mb-8">
                                  {pkg.deliverables?.map((d, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-3 text-sm font-bold text-slate-700"
                                    >
                                      <CheckCircle2
                                        size={16}
                                        className="text-[#FF5B5B]"
                                      />{" "}
                                      {d}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-6 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                                <div className="flex gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                      Timeline
                                    </span>
                                    <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                                      <Clock size={14} /> {pkg.timeline}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                      Revisions
                                    </span>
                                    <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                                      <Zap size={14} /> {pkg.revisions}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    setSelectedPackage({ ...pkg, key: idx })
                                  }
                                  className="px-8 py-3 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-[#FF5B5B] transition-all shadow-md"
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Portfolio Section */}
            {seller.portfolio?.length > 0 && (
              <section className="bg-white rounded-3xl p-8 border-2 border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                    <ImageIcon size={20} />
                  </div>
                  Portfolio{" "}
                  <span className="text-sm text-slate-400">
                    ({seller.portfolio.length})
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {seller.portfolio.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setImageModal(img)}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-zoom-in border-2 border-transparent hover:border-[#FF5B5B] transition-all"
                    >
                      <img
                        src={img}
                        alt="Work"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section className="bg-white rounded-3xl p-8 border-2 border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                  <MessageCircle size={20} />
                </div>
                Reviews{" "}
                <span className="text-sm text-slate-400">
                  ({reviews.length})
                </span>
              </h3>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-[#FF5B5B]">
                            {rev.clientId?.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {rev.clientId?.name || "Client"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-slate-100">
                          <Star
                            size={10}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="text-xs font-black">
                            {rev.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 italic font-medium">
                        "{rev.description}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-slate-400 font-bold italic text-sm">
                  No reviews yet.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {imageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageModal(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <img
              src={imageModal}
              alt="Zoomed"
              className="max-w-full max-h-[90vh] rounded-2xl"
            />
            <button className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
              <X size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedPackage && (
        <BookOrder
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          packageData={selectedPackage}
          seller={seller}
          platform={activeTab}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatBox = ({ label, value, border }) => (
  <div
    className={`text-center px-2 ${border ? "border-x-2 border-slate-50" : ""}`}
  >
    <p className="text-lg font-black text-slate-900">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </p>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
    <div className="p-2.5 bg-white text-[#FF5B5B] rounded-xl shadow-sm border border-slate-100">
      <Icon size={18} />
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

const PlatformStatCard = ({ label, value, icon, highlight }) => (
  <div
    className={`p-6 rounded-2xl border-2 flex flex-col justify-center items-center text-center h-28 transition-all ${highlight ? "bg-red-50 border-red-100" : "bg-white border-slate-100"}`}
  >
    <div className={`mb-2 ${highlight ? "text-[#FF5B5B]" : "text-slate-300"}`}>
      {icon}
    </div>
    <p
      className={`text-xl font-black ${highlight ? "text-[#FF5B5B]" : "text-slate-900"}`}
    >
      {value}
    </p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
      {label}
    </p>
  </div>
);

export default Overview;
