import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
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
  Users,
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
    audienceMin: "",
    audienceMax: "",
    budgetMin: "",
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

  // Animation States (Indices track which platform/package is currently visible per card)
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
    if (!sellers) return;

    const formatted = sellers.map((seller) => {
      const platforms = [];

      // Process campaigns to extract platform-specific data
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

          // Only add platform if it has services
          if (servicesList.length > 0) {
            platforms.push({
              key: pKey,
              username: campaign.username || seller.fullName,
              followers: campaign.followers || 0,
              engagement: campaign.engagementRate || 0,
              services: servicesList,
            });
          }
        });
      }

      // Calculate total reach for sorting/filtering
      const totalReach = platforms.reduce(
        (acc, curr) => acc + curr.followers,
        0,
      );

      return {
        ...seller,
        audience: totalReach,
        platformList: platforms,
      };
    });

    setProcessedSellers(formatted);

    // Initialize animation indices for cycling
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

    // 1. Platform Filter
    if (filters.platform !== "all") {
      result = result.filter((s) =>
        s.platformList.some((p) => p.key === filters.platform),
      );
    }

    // 2. Search Filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(term) ||
          s.niche.toLowerCase().includes(term),
      );
    }

    // 3. Audience Range
    if (filters.audienceMin)
      result = result.filter(
        (s) => s.audience >= parseInt(filters.audienceMin),
      );
    if (filters.audienceMax)
      result = result.filter(
        (s) => s.audience <= parseInt(filters.audienceMax),
      );

    // 4. Budget Range
    if (filters.budgetMin || filters.budgetMax) {
      const min = parseInt(filters.budgetMin) || 0;
      const max = parseInt(filters.budgetMax) || Infinity;
      result = result.filter((s) =>
        s.platformList.some((p) =>
          p.services.some((svc) => svc.amount >= min && svc.amount <= max),
        ),
      );
    }

    setFilteredSellers(result);
  }, [processedSellers, filters]);

  // --- AUTO LOOPS FOR ANIMATION ---

  // 1. Cycle Platforms (Every 5 seconds) - Only if filter is 'all'
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
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredSellers, hoveredCard, filters.platform]);

  // 2. Cycle Packages (Every 2.5 seconds) - Cycles services within the active platform
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
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-32 pt-28 px-3 sm:px-8">
      {/* --- GRID --- */}
      <div className="max-w-[1920px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-[280px] md:h-[380px] bg-white rounded-3xl border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <LayoutGrid size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800">
              No matching creators
            </h3>
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  audienceMin: "",
                  audienceMax: "",
                  budgetMin: "",
                  budgetMax: "",
                  platform: "all",
                })
              }
              className="mt-2 text-primary font-bold text-sm hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSellers.map((seller) => {
                const platforms = seller.platformList || [];
                if (platforms.length === 0) return null;

                // Determine Active Platform
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
                    key={seller._id}
                    onClick={() => navigate(`/explore/${seller._id}`)}
                    onMouseEnter={() => setHoveredCard(seller._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group bg-white rounded-3xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[280px] md:h-[380px] relative"
                  >
                    {/* --- TOP: IMAGE & OVERLAY --- */}
                    <div className="h-[55%] relative overflow-hidden bg-gray-100">
                      <img
                        src={
                          seller.thumbnail || "https://via.placeholder.com/300"
                        }
                        alt={seller.fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Info on Image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm md:text-base font-bold text-white leading-tight line-clamp-1 truncate pr-2">
                            {seller.fullName}
                          </h3>
                          {/* Rating Badge on Image Bottom Right */}
                          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-bold border border-white/10">
                            <Star
                              size={8}
                              className="fill-yellow-400 text-yellow-400"
                            />{" "}
                            {seller.rating || "5.0"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-white/20 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded font-medium border border-white/10 line-clamp-1 truncate max-w-[80px]">
                            {seller.niche}
                          </span>
                          <span className="text-[9px] text-gray-300 flex items-center gap-0.5">
                            <MapPin size={8} /> {seller.location.split(",")[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* --- MIDDLE: DYNAMIC PLATFORM STATS --- */}
                    <div className="px-3 pt-3 pb-2 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        {/* Platform Badge with Color */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activePlatform.key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${platformConfig?.bg || "bg-gray-50"}`}
                          >
                            <PlatformIcon
                              size={12}
                              className={
                                platformConfig?.color || "text-gray-500"
                              }
                            />
                            <span
                              className={`text-[10px] font-bold capitalize ${platformConfig?.color?.replace("text-", "text-opacity-80-")}`}
                            >
                              {activePlatform.key}
                            </span>
                          </motion.div>
                        </AnimatePresence>

                        {/* Verification Badge if needed, or placeholder */}
                        <div className="flex items-center gap-1 text-[9px] text-gray-400">
                          <CheckCircle2 size={10} className="text-primary" />{" "}
                          Verified
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100 text-center flex flex-col justify-center">
                          <p className="text-[9px] uppercase font-bold text-gray-400 leading-none mb-1">
                            Followers
                          </p>
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={activePlatform.followers}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs md:text-sm font-black text-gray-800"
                            >
                              {formatNumber(activePlatform.followers)}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                        <div className="bg-green-50 rounded-xl p-2 border border-green-100 text-center flex flex-col justify-center">
                          <p className="text-[9px] uppercase font-bold text-green-600 leading-none mb-1">
                            Engage
                          </p>
                          <div className="flex items-center justify-center gap-0.5">
                            <TrendingUp size={10} className="text-green-600" />
                            <p className="text-xs md:text-sm font-black text-green-700">
                              {activePlatform.engagement}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- BOTTOM: PRICING TICKER --- */}
                    <div className="h-11 bg-white border-t border-gray-100 flex flex-col justify-center px-4 relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                      <AnimatePresence mode="wait">
                        {services.length > 0 ? (
                          <motion.div
                            key={safeServiceIndex}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full flex justify-between items-center"
                          >
                            <div className="flex flex-col overflow-hidden mr-2">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide truncate">
                                {activeService.name}
                              </span>
                              <span className="text-xs md:text-sm font-black text-primary truncate">
                                Starting ₹
                                {activeService.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-6 h-6 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                              <ChevronRight
                                size={14}
                                className="text-gray-400"
                              />
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-[10px] text-gray-400 italic">
                            View details
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- FLOATING BOTTOM DOCK --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] w-[95%] max-w-[360px] md:max-w-xl">
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-white/95 backdrop-blur-2xl border border-gray-200 shadow-2xl rounded-full p-2 flex items-center justify-between gap-2"
        >
          {/* Search */}
          <div
            className={`flex items-center bg-gray-100 rounded-full transition-all h-10 md:h-12 ${isSearchExpanded ? "flex-1 pl-3 pr-2" : "w-10 md:w-12 justify-center"}`}
          >
            <button
              onClick={toggleSearch}
              className="text-gray-500 hover:text-primary shrink-0"
            >
              <Search size={18} />
            </button>
            {isSearchExpanded && (
              <>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-xs md:text-sm ml-2 w-full text-gray-700 placeholder:text-gray-400 min-w-0"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
                <button
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="text-gray-400"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>

          {!isSearchExpanded && (
            <>
              <div className="h-6 w-px bg-gray-200 mx-1 flex-shrink-0" />

              {/* Platform Selector */}
              <button
                onClick={() => {
                  setShowFilterModal(false);
                  setShowPlatformMenu(!showPlatformMenu);
                }}
                className={`flex-1 h-10 md:h-12 flex items-center justify-center gap-1.5 px-3 rounded-full transition-all ${
                  filters.platform !== "all"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <CurrentPlatformIcon size={16} />
                <span className="capitalize text-[10px] md:text-sm font-bold truncate max-w-[80px]">
                  {filters.platform === "all" ? "All Apps" : filters.platform}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${showPlatformMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Filter Button */}
              <button
                onClick={() => {
                  setShowPlatformMenu(false);
                  setShowFilterModal(!showFilterModal);
                }}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
                  filters.audienceMax || filters.budgetMax
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Filter size={18} />
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* --- FILTER MODAL --- */}
      <AnimatePresence>
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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-2xl z-[70] p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  Refine Search
                </h3>
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      audienceMin: "",
                      audienceMax: "",
                      budgetMin: "",
                      budgetMax: "",
                      platform: "all",
                    })
                  }
                  className="text-xs font-bold text-red-500"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-gray-400" />
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Audience Range
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-3 border border-gray-200">
                      <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">
                        Min
                      </p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent outline-none text-sm font-bold text-gray-900"
                        value={filters.audienceMin}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            audienceMin: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-3 border border-gray-200">
                      <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">
                        Max
                      </p>
                      <input
                        type="number"
                        placeholder="Any"
                        className="w-full bg-transparent outline-none text-sm font-bold text-gray-900"
                        value={filters.audienceMax}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            audienceMax: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase size={16} className="text-gray-400" />
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Budget (₹)
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-3 border border-gray-200">
                      <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">
                        Min ₹
                      </p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent outline-none text-sm font-bold text-gray-900"
                        value={filters.budgetMin}
                        onChange={(e) =>
                          setFilters({ ...filters, budgetMin: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-3 border border-gray-200">
                      <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">
                        Max ₹
                      </p>
                      <input
                        type="number"
                        placeholder="No Limit"
                        className="w-full bg-transparent outline-none text-sm font-bold text-gray-900"
                        value={filters.budgetMax}
                        onChange={(e) =>
                          setFilters({ ...filters, budgetMax: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* PLATFORM MENU */}
        {showPlatformMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlatformMenu(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-2xl z-[70] p-6 pb-8"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setFilters({ ...filters, platform: "all" });
                    setShowPlatformMenu(false);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${filters.platform === "all" ? "bg-primary/5 border-primary text-primary" : "bg-gray-50 border-transparent text-gray-600"}`}
                >
                  <LayoutGrid size={20} />{" "}
                  <span className="font-bold text-sm">All Apps</span>
                </button>
                {Object.entries(socialPlatforms).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilters({ ...filters, platform: key });
                      setShowPlatformMenu(false);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${filters.platform === key ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 border-transparent text-gray-600"}`}
                  >
                    <config.icon
                      size={20}
                      className={
                        filters.platform === key ? "text-white" : config.color
                      }
                    />
                    <span className="font-bold text-sm capitalize">
                      {config.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
