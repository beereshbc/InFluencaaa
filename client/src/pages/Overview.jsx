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
  Link as LinkIcon,
  Zap,
  ArrowLeft,
  Briefcase,
  Languages,
  Image as ImageIcon,
  MessageCircle,
  X,
  ExternalLink,
  Calendar,
  Box,
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

  const getPlatformUrl = (platform, username) => {
    if (!username) return "#";
    const cleanUser = username.replace(/\s+/g, "").replace("@", "");

    switch (platform.toLowerCase()) {
      case "instagram":
        return `https://instagram.com/${cleanUser}`;
      case "youtube":
        return `https://youtube.com/@${cleanUser}`;
      case "twitter":
        return `https://twitter.com/${cleanUser}`;
      case "linkedin":
        return `https://linkedin.com/in/${cleanUser}`;
      case "facebook":
        return `https://facebook.com/${cleanUser}`;
      default:
        return "#";
    }
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
            Loading...
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
    // FIX 1: Increased top padding to prevent Navbar overlap
    <div className="min-h-screen bg-slate-50/50 font-sans pb-32 sm:pb-36 text-slate-900">
      {/* --- HERO IMAGE --- */}
      <div className="relative h-48 md:h-80 w-full bg-slate-900 overflow-hidden">
        {seller.coverImage ? (
          <img
            src={seller.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF5B5B] to-slate-900" />
        )}

        {/* Back Button - Positioned to not conflict with Navbar */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => navigate(-1)}
            className="p-2 md:p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all border border-white/30 shadow-lg active:scale-95"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* FIX 2: Reduced negative margin so profile doesn't go too high */}
        <div className="flex flex-col lg:flex-row gap-6 -mt-16 md:-mt-24">
          {/* --- LEFT SIDEBAR (PROFILE) --- */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              // FIX 3: Added border and sticky positioning for desktop
              className="bg-white rounded-[2rem] shadow-lg border border-slate-200 p-6 md:p-8 lg:sticky lg:top-28"
            >
              <div className="flex flex-col items-center text-center">
                {/* Profile Pic */}
                <div className="relative -mt-20 md:-mt-24 mb-4">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] p-1.5 bg-white shadow-xl border border-slate-100">
                    <img
                      src={
                        seller.thumbnail || "https://via.placeholder.com/150"
                      }
                      alt={seller.fullName}
                      className="w-full h-full object-cover rounded-[1.7rem]"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-slate-100 flex items-center gap-1 min-w-max">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm font-black text-slate-900">
                      {seller.rating}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      ({seller.totalReviews} Rev)
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                    {seller.fullName}{" "}
                    <CheckCircle2
                      size={22}
                      className="text-[#FF5B5B] fill-red-50"
                    />
                  </h1>
                  <span className="inline-block mt-2 px-4 py-1 bg-red-50 text-[#FF5B5B] border border-red-100 text-xs font-bold uppercase tracking-widest rounded-full">
                    {seller.niche}
                  </span>
                </div>

                {/* Inline Stats Row */}
                <div className="flex items-center justify-center gap-4 w-full mt-8 mb-8 py-4 border-y border-slate-100">
                  <div className="text-center px-4">
                    <p className="text-xl font-black text-slate-900">
                      {formatNumber(seller.audience)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Reach
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center px-4">
                    <p className="text-xl font-black text-slate-900">
                      {seller.avgEngagementRate || 0}%
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Engage
                    </p>
                  </div>
                </div>

                {/* FIX 4: Detailed Seller Info */}
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold flex items-center gap-2">
                      <MapPin size={16} /> From
                    </span>
                    <span className="font-bold text-slate-800">
                      {seller.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold flex items-center gap-2">
                      <Languages size={16} /> Speaks
                    </span>
                    <span className="font-bold text-slate-800 text-right">
                      {seller.languages?.join(", ") || "English"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold flex items-center gap-2">
                      <Clock size={16} /> Avg. Response
                    </span>
                    <span className="font-bold text-slate-800">
                      {seller.responseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold flex items-center gap-2">
                      <Calendar size={16} /> Joined
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-8">
                  <button
                    onClick={handleShare}
                    className="w-full py-4 bg-[#FF5B5B] hover:bg-[#E04F4F] text-white rounded-2xl font-black text-sm shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <LinkIcon size={18} />{" "}
                    {copied ? "Link Copied!" : "Share Profile"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="w-full lg:flex-1 space-y-8">
            {/* Bio Box */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FF5B5B] rounded-full" /> About Me
              </h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                {seller.bio || "This creator hasn't written a bio yet."}
              </p>
            </div>

            {/* Platform Tabs & Content */}
            {seller.campaigns?.length > 0 && (
              <div className="space-y-6">
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {seller.campaigns.map((camp) => {
                    const pKey = camp.platform.toLowerCase();
                    const Icon = socialIcons[pKey] || Globe;
                    const isActive = activeTab === pKey;
                    return (
                      <button
                        key={pKey}
                        onClick={() => setActiveTab(pKey)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all border-2 ${isActive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                      >
                        <Icon size={16} /> {camp.platform}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {activeCampaign && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Compact Stats Box */}
                      <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex gap-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-900">
                              <Users size={20} />
                            </div>
                            <div>
                              <p className="text-xl font-black text-slate-900 leading-none">
                                {formatNumber(activeCampaign.followers)}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                Followers
                              </p>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-slate-100"></div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-[#FF5B5B]">
                              <TrendingUp size={20} />
                            </div>
                            <div>
                              <p className="text-xl font-black text-slate-900 leading-none">
                                {activeCampaign.engagementRate}%
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                Engage
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            window.open(
                              getPlatformUrl(
                                activeCampaign.platform,
                                activeCampaign.username,
                              ),
                              "_blank",
                            )
                          }
                          className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors w-full md:w-auto justify-center"
                        >
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900 leading-none">
                              @{activeCampaign.username}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1">
                              Visit <ExternalLink size={10} />
                            </p>
                          </div>
                          <div className="p-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                            <Globe size={16} className="text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Packages Grid */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {activeCampaign.packages?.map((pkg, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-[2rem] p-6 border-2 border-slate-200 hover:border-[#FF5B5B] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                  {pkg.serviceType}
                                </span>
                                <span className="text-2xl md:text-3xl font-black text-slate-900">
                                  ₹{pkg.amount.toLocaleString()}
                                </span>
                              </div>
                              <h4 className="text-lg md:text-xl font-black text-slate-900 mb-3">
                                {pkg.name}
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                                {pkg.description}
                              </p>
                              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                                  What's Included:
                                </p>
                                <div className="space-y-2.5">
                                  {pkg.deliverables?.map((d, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 text-sm font-bold text-slate-700"
                                    >
                                      <CheckCircle2
                                        size={16}
                                        className="text-[#FF5B5B] mt-0.5 shrink-0"
                                      />
                                      <span className="leading-tight">{d}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <Clock size={16} className="text-slate-400" />{" "}
                                  {pkg.timeline} Delivery
                                </span>
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <Zap size={16} className="text-slate-400" />{" "}
                                  {pkg.revisions} Revision
                                  {pkg.revisions !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  setSelectedPackage({ ...pkg, key: idx })
                                }
                                className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-[#FF5B5B] transition-all shadow-lg"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Portfolio Grid - FIX 5: Smaller Grid Items */}
            {seller.portfolio?.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#FF5B5B] rounded-full" />{" "}
                  Portfolio{" "}
                  <span className="text-slate-400 ml-1 text-sm font-bold">
                    ({seller.portfolio.length})
                  </span>
                </h3>
                {/* 3 columns on mobile, 5 on desktop */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {seller.portfolio.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setImageModal(img)}
                      className="aspect-square rounded-xl overflow-hidden bg-slate-50 cursor-zoom-in border border-slate-200 hover:border-[#FF5B5B] transition-all relative group"
                    >
                      <img
                        src={img}
                        alt="Work"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews - FIX 6: Thinner padding */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FF5B5B] rounded-full" /> Reviews{" "}
                <span className="text-slate-400 ml-1 text-sm font-bold">
                  ({reviews.length})
                </span>
              </h3>
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((rev, idx) => (
                    // Reduced Padding (p-4)
                    <div
                      key={idx}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#FF5B5B] font-black text-xs shadow-sm border border-slate-200">
                          {rev.clientId?.name?.charAt(0) || "C"}
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-900 block leading-none">
                            {rev.clientId?.name || "Verified Client"}
                          </span>
                          <div className="flex text-yellow-400 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={8} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-[10px] text-slate-400 font-bold px-2 py-1 bg-white rounded-lg border border-slate-200">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed pl-11">
                        "{rev.description}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <MessageCircle size={20} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">
                    No reviews yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {imageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageModal(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={imageModal}
              className="max-w-full max-h-[90vh] rounded-[2rem] shadow-2xl"
            />
            <button className="absolute top-8 right-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
              <X size={32} />
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

export default Overview;
