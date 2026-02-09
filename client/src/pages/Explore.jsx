import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  DollarSign,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Filter,
  TrendingUp,
  MapPin,
  Briefcase,
  Star,
  ChevronRight,
  Globe,
  X,
  LayoutGrid,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../context/ClientContext";

const Explore = () => {
  const navigate = useNavigate();
  const { sellers, loading, getAllSellers } = useClientContext();

  // --- STATE ---
  const [filters, setFilters] = useState({
    search: "",
    audienceMax: "",
    budgetMax: "",
    platform: "all",
  });

  // UI States
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Data States
  const [processedSellers, setProcessedSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);

  // Animation States
  const [activePlatformIndices, setActivePlatformIndices] = useState({});
  const [activeServiceIndices, setActiveServiceIndices] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  const searchInputRef = useRef(null);

  // --- CONFIG ---
  const socialPlatforms = {
    instagram: {
      label: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    youtube: {
      label: "YouTube",
      icon: Youtube,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    facebook: {
      label: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    linkedin: {
      label: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    twitter: {
      label: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
  };

  // --- INIT ---
  useEffect(() => {
    getAllSellers();
  }, []);

  // --- DATA PROCESSING ---
  useEffect(() => {
    if (!sellers || sellers.length === 0) return;

    const formatted = sellers.map((seller) => {
      const platforms = [];
      if (seller.campaigns) {
        seller.campaigns.forEach((campaign) => {
          const pKey = campaign.platform.toLowerCase();
          const servicesList = [];
          if (campaign.packages) {
            campaign.packages.forEach((pkg) => {
              if (pkg.published) {
                servicesList.push({
                  name: pkg.name || pkg.serviceType,
                  amount: pkg.amount,
                  type: pkg.serviceType,
                });
              }
            });
          }
          platforms.push({
            key: pKey,
            username: campaign.username || seller.fullName,
            followers: campaign.followers || 0,
            engagement: campaign.engagementRate || 0,
            services: servicesList,
          });
        });
      }
      return {
        ...seller,
        audience: seller.totalFollowers || seller.audience || 0,
        platformList: platforms,
      };
    });

    setProcessedSellers(formatted);

    const pIndices = {};
    const sIndices = {};
    formatted.forEach((s) => {
      pIndices[s._id] = 0;
      sIndices[s._id] = 0;
    });
    setActivePlatformIndices(pIndices);
    setActiveServiceIndices(sIndices);
  }, [sellers]);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = [...processedSellers];

    if (filters.platform !== "all") {
      result = result.filter((s) =>
        s.platformList.some((p) => p.key === filters.platform),
      );
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(term) ||
          s.niche.toLowerCase().includes(term),
      );
    }

    if (filters.audienceMax) {
      result = result.filter(
        (s) => s.audience <= parseInt(filters.audienceMax),
      );
    }
    if (filters.budgetMax) {
      const budget = parseInt(filters.budgetMax);
      result = result.filter((s) =>
        s.platformList.some((p) =>
          p.services.some((svc) => svc.amount <= budget),
        ),
      );
    }

    setFilteredSellers(result);
  }, [processedSellers, filters]);

  // --- AUTO LOOPS ---
  useEffect(() => {
    if (filters.platform !== "all") return;
    const interval = setInterval(() => {
      setActivePlatformIndices((prev) => {
        const next = { ...prev };
        filteredSellers.forEach((seller) => {
          if (hoveredCard !== seller._id && seller.platformList.length > 1) {
            next[seller._id] =
              (prev[seller._id] + 1) % seller.platformList.length;
          }
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [filteredSellers, hoveredCard, filters.platform]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveServiceIndices((prev) => {
        const next = { ...prev };
        filteredSellers.forEach((seller) => {
          const pIndex =
            filters.platform !== "all"
              ? seller.platformList.findIndex((p) => p.key === filters.platform)
              : activePlatformIndices[seller._id] || 0;
          const safePIndex = pIndex === -1 ? 0 : pIndex;
          const currentPlatform = seller.platformList[safePIndex];
          if (currentPlatform?.services?.length > 1) {
            next[seller._id] =
              (prev[seller._id] + 1) % currentPlatform.services.length;
          }
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [filteredSellers, activePlatformIndices, filters.platform]);

  // --- HANDLERS ---
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num;
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded)
      setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const CurrentPlatformIcon =
    filters.platform === "all"
      ? LayoutGrid
      : socialPlatforms[filters.platform]?.icon || Globe;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 pt-32 px-6 sm:px-16">
      {/* --- GRID --- */}
      <div className="max-w-[1920px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] bg-white rounded-3xl border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <LayoutGrid size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">
              No results found
            </h3>
            <p className="text-gray-500">
              Try changing your filters in the dock below
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredSellers.map((seller, index) => {
                const platforms = seller.platformList || [];
                if (platforms.length === 0) return null;

                let activeIndex;
                if (filters.platform !== "all") {
                  activeIndex = platforms.findIndex(
                    (p) => p.key === filters.platform,
                  );
                  if (activeIndex === -1) activeIndex = 0;
                } else {
                  activeIndex =
                    (activePlatformIndices[seller._id] || 0) % platforms.length;
                }

                const activePlatform = platforms[activeIndex];
                const services = activePlatform.services || [];
                const safeServiceIndex =
                  (activeServiceIndices[seller._id] || 0) %
                  (services.length || 1);
                const activeService = services[safeServiceIndex];

                const PlatformIcon =
                  socialPlatforms[activePlatform.key]?.icon || Globe;
                const platformConfig = socialPlatforms[activePlatform.key];

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={seller._id}
                    onClick={() => navigate(`/explore/${seller._id}`)}
                    onMouseEnter={() => setHoveredCard(seller._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group bg-white rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden h-[400px] flex flex-col relative"
                  >
                    {/* --- TOP HALF: FULL IMAGE --- */}
                    <div className="h-[50%] relative overflow-hidden bg-gray-100">
                      <img
                        src={
                          seller.thumbnail || "https://via.placeholder.com/300"
                        }
                        alt={seller.fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      {/* Name Overlay */}
                      <div className="absolute bottom-4 left-5 right-5">
                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
                          {seller.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md font-medium border border-white/10">
                            {seller.niche}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-200 font-medium">
                            <MapPin size={10} /> {seller.location}
                          </div>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/10">
                        <span className="text-xs font-black text-gray-900">
                          {seller.rating || 5.0}
                        </span>
                        <Star
                          size={10}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      </div>
                    </div>

                    {/* --- MIDDLE: CONTENT --- */}
                    <div className="px-5 relative flex-1 flex flex-col pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-md">
                          {seller.niche}
                        </p>
                        {/* Current Platform Icon */}
                        <div
                          className={`p-1.5 rounded-lg ${platformConfig?.bg || "bg-gray-100"}`}
                        >
                          <PlatformIcon
                            size={16}
                            className={platformConfig?.color || "text-gray-500"}
                          />
                        </div>
                      </div>

                      {/* Dynamic Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                            Audience
                          </p>
                          <p className="text-lg font-black text-gray-800">
                            {formatNumber(activePlatform.followers)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-2.5 border border-green-100">
                          <p className="text-[10px] uppercase font-bold text-green-600 mb-0.5">
                            Engage.
                          </p>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} className="text-green-600" />
                            <p className="text-lg font-black text-green-700">
                              {activePlatform.engagement}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- BOTTOM: AUTO-SLIDING PRICING --- */}
                    <div className="mt-auto h-14 bg-white border-t border-gray-100 flex items-center px-6 relative group-hover:bg-primary/5 transition-colors">
                      <Briefcase size={16} className="text-gray-400 mr-3" />
                      <div className="flex-1 h-full relative overflow-hidden">
                        <AnimatePresence mode="wait">
                          {services.length > 0 ? (
                            <motion.div
                              key={safeServiceIndex}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 flex items-center justify-between w-full"
                            >
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {activeService.name}
                              </span>
                              <span className="text-base font-black text-primary">
                                ₹{activeService.amount.toLocaleString()}
                              </span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center h-full text-xs font-medium text-gray-400 italic">
                              View profile for pricing
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 ml-2" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- FLOATING BOTTOM DOCK --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl px-2">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/95 backdrop-blur-2xl border border-gray-200 shadow-2xl rounded-full p-2.5 flex items-center justify-between gap-3 overflow-hidden"
        >
          {/* 1. Search (Expands) */}
          <div
            className={`flex items-center bg-gray-100 rounded-full transition-all duration-300 ease-in-out h-12 ${isSearchExpanded ? "flex-1 pl-4 pr-2" : "w-12 justify-center flex-none"}`}
          >
            <button
              onClick={toggleSearch}
              className="text-gray-500 hover:text-primary"
            >
              <Search size={20} />
            </button>
            {isSearchExpanded && (
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder:text-gray-400 min-w-0"
                value={filters.search}
                onBlur={() => !filters.search && setIsSearchExpanded(false)}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            )}
            {isSearchExpanded && filters.search && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFilters({ ...filters, search: "" });
                }}
                className="ml-1 text-gray-400 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!isSearchExpanded && (
            <>
              <div className="h-8 w-px bg-gray-200 mx-1 flex-shrink-0"></div>

              {/* 2. Platform Selector */}
              <div className="relative flex-1">
                <button
                  onClick={() => {
                    setShowFilterModal(false); // Close other modal
                    setShowPlatformMenu(!showPlatformMenu);
                  }}
                  className={`w-full h-12 flex items-center justify-center gap-2 px-4 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    filters.platform !== "all"
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <CurrentPlatformIcon size={18} />
                  <span className="capitalize text-xs sm:text-sm truncate">
                    {filters.platform === "all" ? "All Apps" : filters.platform}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform flex-shrink-0 ${showPlatformMenu ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-1 flex-shrink-0"></div>

              {/* 3. Filter Trigger */}
              <button
                onClick={() => {
                  setShowPlatformMenu(false); // Close other modal
                  setShowFilterModal(!showFilterModal);
                }}
                className={`flex-none flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  filters.budgetMax || filters.audienceMax
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Filter size={20} />
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* --- MODALS (Fixed & Safe) --- */}
      <AnimatePresence>
        {/* PLATFORM MENU */}
        {showPlatformMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlatformMenu(false)}
              className="fixed inset-0 z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
              // Compact fixed width for mobile
              className="fixed bottom-24 left-1/2 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100 p-2 z-[70] overflow-hidden"
            >
              <button
                onClick={() => {
                  setFilters({ ...filters, platform: "all" });
                  setShowPlatformMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${filters.platform === "all" ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <LayoutGrid size={18} /> All Apps
              </button>
              <div className="h-px bg-gray-100 my-1" />
              {Object.entries(socialPlatforms).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilters({ ...filters, platform: key });
                    setShowPlatformMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${filters.platform === key ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <config.icon size={18} className={config.color} />{" "}
                  {config.label}
                </button>
              ))}
            </motion.div>
          </>
        )}

        {/* FILTER MODAL */}
        {showFilterModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
              // Compact fixed width for mobile
              className="fixed bottom-24 left-1/2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-[70]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  Refine Search
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Max Audience
                    </label>
                    <span className="text-xs font-bold text-primary">
                      {formatNumber(filters.audienceMax) || "Any"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="1000000"
                    step="10000"
                    value={filters.audienceMax || 1000000}
                    onChange={(e) =>
                      setFilters({ ...filters, audienceMax: e.target.value })
                    }
                    className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Max Budget (₹)
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="No limit"
                      value={filters.budgetMax}
                      onChange={(e) =>
                        setFilters({ ...filters, budgetMax: e.target.value })
                      }
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setFilters({
                        search: "",
                        audienceMax: "",
                        budgetMax: "",
                        platform: "all",
                      });
                      setShowFilterModal(false);
                    }}
                    className="py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
