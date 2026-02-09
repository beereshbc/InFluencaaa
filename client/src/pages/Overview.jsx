import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  Globe,
  MessageSquare,
  CheckCircle2,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Users,
  TrendingUp,
  Share2,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Briefcase,
  Languages,
} from "lucide-react";
import { useClientContext } from "../context/ClientContext";
import BookOrder from "../components/BookOrder";

const Overview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sellers, loading, getAllSellers } = useClientContext();

  const [seller, setSeller] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null); // State for modal

  // --- CONFIGURATION ---
  const socialIcons = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    if (sellers.length === 0) {
      getAllSellers();
    } else {
      const foundSeller = sellers.find((s) => s._id === id);
      setSeller(foundSeller);
      if (foundSeller?.campaigns?.length > 0) {
        setActiveTab(foundSeller.campaigns[0].platform.toLowerCase());
      }
    }
  }, [id, sellers]);

  // --- HELPER FUNCTIONS ---
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getActiveCampaign = () => {
    return seller?.campaigns?.find(
      (c) => c.platform.toLowerCase() === activeTab,
    );
  };

  // --- LOADING STATES ---
  if (loading || (!seller && sellers.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">Seller not found</h2>
        <button
          onClick={() => navigate("/explore")}
          className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const activeCampaign = getActiveCampaign();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* --- HERO HEADER --- */}
      <div className="relative h-64 lg:h-80 w-full bg-slate-900 overflow-hidden">
        {seller.coverImage ? (
          <img
            src={seller.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900" />
        )}

        {/* Navigation */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pt-8 lg:pt-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- LEFT SIDEBAR: PROFILE CARD --- */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-28"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-36 h-36 rounded-[2rem] p-1 bg-white shadow-lg">
                    <img
                      src={
                        seller.thumbnail || "https://via.placeholder.com/150"
                      }
                      alt={seller.fullName}
                      className="w-full h-full object-cover rounded-[1.8rem]"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border border-gray-100 flex items-center gap-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-xs font-bold text-gray-900">
                      {seller.rating}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mt-5 flex items-center justify-center gap-2">
                  {seller.fullName}
                  <CheckCircle2
                    size={22}
                    className="text-primary fill-primary/10"
                  />
                </h1>

                <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-lg">
                  {seller.niche}
                </span>

                {/* Key Stats Row */}
                <div className="grid grid-cols-3 gap-4 w-full mt-8 pb-8 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900">
                      {formatNumber(seller.audience)}
                    </p>
                    <p className="text-xs font-medium text-gray-400">
                      Audience
                    </p>
                  </div>
                  <div className="text-center border-l border-r border-gray-100">
                    <p className="text-lg font-black text-gray-900">
                      {seller.totalReviews || 0}
                    </p>
                    <p className="text-xs font-medium text-gray-400">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900">
                      {seller.avgEngagementRate || 0}%
                    </p>
                    <p className="text-xs font-medium text-gray-400">Engage.</p>
                  </div>
                </div>

                {/* Info List */}
                <div className="w-full space-y-4 mt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-400 font-bold uppercase">
                        Location
                      </p>
                      <p className="font-semibold text-gray-900">
                        {seller.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-400 font-bold uppercase">
                        Response Time
                      </p>
                      <p className="font-semibold text-gray-900">
                        {seller.responseTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Languages size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-400 font-bold uppercase">
                        Languages
                      </p>
                      <p className="font-semibold text-gray-900 truncate">
                        {seller.languages?.join(", ") || "English"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full mt-8 space-y-3">
                  <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    <MessageSquare size={18} /> Contact Creator
                  </button>
                  <button className="w-full py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <Share2 size={18} /> Share Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                About Me
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {seller.bio || "This creator hasn't added a bio yet."}
              </p>
            </motion.div>

            {/* Platform Tabs & Content */}
            {seller.campaigns?.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {seller.campaigns.map((camp) => {
                    const pKey = camp.platform.toLowerCase();
                    const Icon = socialIcons[pKey] || Globe;
                    const isActive = activeTab === pKey;

                    return (
                      <button
                        key={pKey}
                        onClick={() => setActiveTab(pKey)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
                          isActive
                            ? "bg-primary text-white border-primary shadow-lg scale-105"
                            : "bg-white text-gray-500 border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="capitalize">{camp.platform}</span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {activeCampaign ? (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Platform Specific Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
                            <Users size={64} />
                          </div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Followers
                          </p>
                          <p className="text-3xl font-black text-gray-900">
                            {formatNumber(activeCampaign.followers)}
                          </p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
                            <TrendingUp size={64} />
                          </div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Engagement
                          </p>
                          <p className="text-3xl font-black text-gray-900">
                            {activeCampaign.engagementRate}%
                          </p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Handle
                          </p>
                          <p className="text-lg font-bold text-primary truncate">
                            @{activeCampaign.username}
                          </p>
                        </div>
                      </div>

                      {/* PACKAGES LIST */}
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                          <Briefcase className="text-primary" />
                          Packages
                        </h3>

                        <div className="grid grid-cols-1 gap-5">
                          {activeCampaign.packages?.map((pkg, index) => (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              key={index}
                              className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                      {pkg.name || pkg.serviceType}
                                    </h4>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-lg">
                                      {pkg.serviceType}
                                    </span>
                                  </div>
                                  <p className="text-gray-500 text-sm max-w-lg">
                                    {pkg.description ||
                                      "Comprehensive package for your brand promotion."}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="block text-3xl font-black text-gray-900">
                                    ₹{pkg.amount.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium">
                                    Starting Price
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                                    Deliverables
                                  </p>
                                  <ul className="space-y-2">
                                    {pkg.deliverables?.length > 0 ? (
                                      pkg.deliverables.map((item, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-sm text-gray-700 font-medium"
                                        >
                                          <CheckCircle2
                                            size={16}
                                            className="text-primary mt-0.5 flex-shrink-0"
                                          />
                                          {item}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-sm text-gray-400 italic">
                                        No specific deliverables listed
                                      </li>
                                    )}
                                  </ul>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Clock
                                        size={16}
                                        className="text-primary"
                                      />{" "}
                                      Delivery
                                    </div>
                                    <span className="font-bold text-gray-900">
                                      {pkg.timeline || "3 Days"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Zap
                                        size={16}
                                        className="text-yellow-500"
                                      />{" "}
                                      Revisions
                                    </div>
                                    <span className="font-bold text-gray-900">
                                      {pkg.revisions || 1}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex justify-end">
                                <button
                                  onClick={() =>
                                    setSelectedPackage({
                                      ...pkg,
                                      key: `I${index + 1}`,
                                    })
                                  }
                                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                  Book Package
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {(!activeCampaign.packages ||
                          activeCampaign.packages.length === 0) && (
                          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">
                              No packages listed for {activeCampaign.platform}{" "}
                              yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                      <p className="text-gray-500">
                        Select a platform to view details.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Order Modal */}
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
