import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  CheckCircle,
  Clock,
  Edit3,
  Plus,
  Trash2,
  Package,
  Layers,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSellerContext } from "../context/SellerContext";
import toast from "react-hot-toast";

// --- STATIC CONFIGURATION ---
const STATIC_PLATFORMS = {
  instagram: {
    key: "instagram",
    icon: Instagram,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    hoverBorder: "group-hover:border-pink-300",
    label: "Instagram",
  },
  youtube: {
    key: "youtube",
    icon: Youtube,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    hoverBorder: "group-hover:border-red-300",
    label: "YouTube",
  },
  twitter: {
    key: "twitter",
    icon: Twitter,
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    hoverBorder: "group-hover:border-sky-300",
    label: "Twitter",
  },
  linkedin: {
    key: "linkedin",
    icon: Linkedin,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hoverBorder: "group-hover:border-blue-300",
    label: "LinkedIn",
  },
};

const Campaigns = () => {
  const { sellerData, axios, sellerToken, getProfile } = useSellerContext();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("live");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Portfolio State
  const [portfolio, setPortfolio] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Derived Data
  const connectedPlatforms =
    sellerData?.connectedPlatforms?.map((p) => p.platform.toLowerCase()) || [];

  // Find current active campaign data based on selected platform
  const activeCampaign = campaigns.find((c) => c.platform === selectedPlatform);

  const platformConfig =
    STATIC_PLATFORMS[selectedPlatform] || STATIC_PLATFORMS.instagram;

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (sellerToken) {
      fetchCampaigns();
      // Sync portfolio from context
      if (sellerData?.portfolio) {
        setPortfolio(sellerData.portfolio);
      }
    }
  }, [sellerToken, sellerData]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get("/api/seller/campaigns", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      if (data.success) {
        setCampaigns(data.campaigns);
        // Default to first connected platform if none selected
        if (!selectedPlatform && connectedPlatforms.length > 0) {
          setSelectedPlatform(connectedPlatforms[0]);
        }
      }
    } catch (err) {
      toast.error("Failed to sync campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS: PACKAGES ---
  const handleSavePackage = async (packageData) => {
    try {
      if (editingPackage) {
        // Update
        const { data } = await axios.put(
          `/api/seller/campaigns/package/${activeCampaign._id}/${editingPackage._id}`,
          packageData,
          { headers: { Authorization: `Bearer ${sellerToken}` } },
        );
        if (data.success) toast.success("Package updated successfully");
      } else {
        // Create
        const { data } = await axios.post(
          "/api/seller/campaigns/add",
          { platform: selectedPlatform, newPackage: packageData },
          { headers: { Authorization: `Bearer ${sellerToken}` } },
        );
        if (data.success) toast.success("New package created");
      }
      setShowModal(false);
      setEditingPackage(null);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;
    try {
      const { data } = await axios.delete(
        `/api/seller/campaigns/package/${activeCampaign._id}/${packageId}`,
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );
      if (data.success) {
        toast.success("Package deleted");
        fetchCampaigns();
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const handleTogglePublish = async (pkg) => {
    try {
      await axios.put(
        `/api/seller/campaigns/package/${activeCampaign._id}/${pkg._id}`,
        { published: !pkg.published },
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );
      toast.success(pkg.published ? "Unpublished (Draft)" : "Published (Live)");
      fetchCampaigns();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  // --- ACTIONS: PORTFOLIO ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate size (Client side check approx 5MB)
    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      return toast.error("Some files exceed 5MB limit");
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading snaps...");

    try {
      const { data } = await axios.post("/api/seller/portfolio/add", formData, {
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        setPortfolio(data.portfolio);
        toast.success("Portfolio updated!", { id: loadingToast });
        getProfile(); // Update global context
      }
    } catch (error) {
      toast.error("Upload failed", { id: loadingToast });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("Remove this snap from your portfolio?")) return;
    try {
      const { data } = await axios.put(
        "/api/seller/portfolio/remove",
        { imageUrl },
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );
      if (data.success) {
        setPortfolio(data.portfolio);
        toast.success("Snap removed");
        getProfile();
      }
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  // --- RENDER HELPERS ---
  const filteredPackages =
    activeCampaign?.packages?.filter((p) =>
      activeTab === "live" ? p.published : !p.published,
    ) || [];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="text-gray-400 font-medium text-sm">
            Loading Workspace...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-4 md:px-8 font-sans text-gray-900">
      <div className="max-w-[1400px] mx-auto">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Layers size={24} />
              </div>
              Campaign Manager
            </h1>
            <p className="text-gray-500 font-medium mt-2 max-w-md">
              Configure your service offerings, pricing, and showcase your best
              work to potential clients.
            </p>
          </div>

          <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
            {["live", "drafts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                {tab}{" "}
                <span className="opacity-60 ml-1">
                  (
                  {activeCampaign?.packages?.filter((p) =>
                    tab === "live" ? p.published : !p.published,
                  ).length || 0}
                  )
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR: PLATFORMS --- */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Connected Platforms
            </h3>
            {Object.values(STATIC_PLATFORMS).map((plat) => {
              const isConnected = connectedPlatforms.includes(plat.key);
              const isActive = selectedPlatform === plat.key;

              return (
                <button
                  key={plat.key}
                  disabled={!isConnected}
                  onClick={() => setSelectedPlatform(plat.key)}
                  className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 overflow-hidden border ${
                    !isConnected
                      ? "opacity-50 grayscale bg-gray-50 border-transparent cursor-not-allowed"
                      : isActive
                        ? `bg-white shadow-xl shadow-gray-200/50 ${plat.border}`
                        : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activePlatformBorder"
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${plat.bg.replace("bg-", "bg-")}-500`}
                    />
                  )}

                  <div
                    className={`p-3 rounded-xl transition-colors ${isActive ? plat.bg + " " + plat.color : "bg-gray-100 text-gray-400 group-hover:text-gray-600"}`}
                  >
                    <plat.icon size={20} strokeWidth={2.5} />
                  </div>

                  <div className="text-left flex-1">
                    <span
                      className={`block font-bold text-sm ${isActive ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {plat.label}
                    </span>
                    {isConnected ? (
                      <span className="text-[10px] font-bold text-green-600 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300">
                        Not Connected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-9 space-y-10">
            {!selectedPlatform ? (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Layers size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No Platform Selected
                </h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Select a connected social media account from the sidebar to
                  manage its packages.
                </p>
              </div>
            ) : (
              <>
                {/* --- 1. PLATFORM SUMMARY CARD --- */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                  {/* Decorative Background Blob */}
                  <div
                    className={`absolute -top-24 -right-24 w-64 h-64 ${platformConfig.bg} rounded-full opacity-50 blur-3xl`}
                  />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-[1.5rem] p-1 bg-white shadow-md">
                          <img
                            src={
                              activeCampaign?.profilePicture ||
                              "https://via.placeholder.com/150"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover rounded-[1.2rem]"
                          />
                        </div>
                        <div
                          className={`absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 ${platformConfig.color}`}
                        >
                          <platformConfig.icon
                            size={14}
                            fill="currentColor"
                            className="opacity-20"
                          />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                          @{activeCampaign?.username || "username"}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <Users size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-700">
                              {activeCampaign?.followers?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-lg border border-green-100">
                            <TrendingUp size={14} className="text-green-600" />
                            <span className="text-xs font-bold text-green-700">
                              {activeCampaign?.engagementRate || 0}% ER
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPackage(null);
                        setShowModal(true);
                      }}
                      className="group flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-gray-200 hover:-translate-y-1"
                    >
                      <Plus
                        size={20}
                        className="group-hover:rotate-90 transition-transform"
                      />
                      Create Package
                    </button>
                  </div>
                </div>

                {/* --- 2. PACKAGES GRID --- */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end px-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Package size={20} className="text-indigo-600" /> Service
                      Packages
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredPackages.length > 0 ? (
                        filteredPackages.map((pkg) => (
                          <motion.div
                            key={pkg._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 hover:border-indigo-100 transition-all duration-300 group"
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Left: Details */}
                              <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${platformConfig.bg} ${platformConfig.color}`}
                                  >
                                    {pkg.serviceType}
                                  </span>

                                  {/* Actions Toolbar (Visible on Hover/Focus) */}
                                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleTogglePublish(pkg)}
                                      className={`p-2 rounded-xl transition-colors ${pkg.published ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                      title={
                                        pkg.published ? "Unpublish" : "Publish"
                                      }
                                    >
                                      {pkg.published ? (
                                        <Eye size={16} />
                                      ) : (
                                        <EyeOff size={16} />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingPackage(pkg);
                                        setShowModal(true);
                                      }}
                                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeletePackage(pkg._id)
                                      }
                                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                  {pkg.name}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-2xl">
                                  {pkg.description}
                                </p>

                                <div className="flex flex-wrap gap-3">
                                  {pkg.deliverables?.slice(0, 3).map((d, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1.5"
                                    >
                                      <CheckCircle
                                        size={12}
                                        className="text-green-500"
                                      />{" "}
                                      {d}
                                    </span>
                                  ))}
                                  {pkg.deliverables?.length > 3 && (
                                    <span className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-400">
                                      +{pkg.deliverables.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right: Pricing & Meta */}
                              <div className="bg-gray-50/50 p-8 w-full md:w-72 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center">
                                <div className="mb-6">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Starting Price
                                  </p>
                                  <p className="text-3xl font-black text-gray-900">
                                    ₹{pkg.amount.toLocaleString()}
                                  </p>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200/50">
                                    <span className="text-xs font-bold text-gray-400 uppercase">
                                      Delivery
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                      <Clock size={14} /> {pkg.timeline}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200/50">
                                    <span className="text-xs font-bold text-gray-400 uppercase">
                                      Revisions
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                      <Zap
                                        size={14}
                                        className="text-yellow-500"
                                      />{" "}
                                      {pkg.revisions}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="text-gray-300" size={28} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            No {activeTab} packages found
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            Create a new package to get started with{" "}
                            {STATIC_PLATFORMS[selectedPlatform].label}
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* --- 3. PORTFOLIO SECTION --- */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-2">
                        <ImageIcon size={22} className="text-purple-500" /> Past
                        Work & Portfolio
                      </h2>
                      <p className="text-sm text-gray-500">
                        Upload high-quality snaps of your previous work. This
                        helps brands trust your quality.
                      </p>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <UploadCloud size={18} />
                        )}
                        {isUploading ? "Uploading..." : "Upload Snaps"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {portfolio.map((imgUrl, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer"
                        >
                          <img
                            src={imgUrl}
                            alt="Portfolio"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <button
                              onClick={() => window.open(imgUrl, "_blank")}
                              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors backdrop-blur-md"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(imgUrl)}
                              className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-md shadow-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty State / Add Placeholder */}
                    {portfolio.length === 0 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-500">
                          No portfolio snaps yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Click to upload images
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- REUSABLE MODAL --- */}
      <AddEditPackageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePackage}
        platformName={STATIC_PLATFORMS[selectedPlatform]?.label}
        initialData={editingPackage}
      />
    </div>
  );
};

// --- SUB-COMPONENTS ---

// Modal for Adding/Editing Packages
const AddEditPackageModal = ({
  isOpen,
  onClose,
  onSave,
  platformName,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    serviceType: "Post",
    amount: "",
    description: "",
    deliverables: [""],
    requirements: [""],
    timeline: "3 Days",
    revisions: 1,
    published: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) setFormData(initialData);
      else
        setFormData({
          name: "",
          serviceType: "Post",
          amount: "",
          description: "",
          deliverables: [""],
          requirements: [""],
          timeline: "3 Days",
          revisions: 1,
          published: true,
        });
    }
  }, [initialData, isOpen]);

  const handleArrayChange = (index, value, field) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData({ ...formData, [field]: newArr });
  };

  const modifyArray = (action, field, index = null) => {
    let newArr = [...formData[field]];
    if (action === "add") newArr.push("");
    if (action === "remove") newArr = newArr.filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArr });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {initialData ? "Edit Package" : `Create ${platformName} Package`}
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
              Configure details & pricing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* 1. Basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Basic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Package Title
                </label>
                <input
                  className="w-full p-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-gray-900 transition-all"
                  placeholder="e.g. Premium Reel"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Service Type
                </label>
                <select
                  className="w-full p-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-gray-900 transition-all appearance-none"
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                >
                  {[
                    "Post",
                    "Video",
                    "Story",
                    "Reel",
                    "Carousel",
                    "Live Stream",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                Description
              </label>
              <textarea
                rows="3"
                className="w-full p-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none text-sm font-medium text-gray-700 transition-all resize-none"
                placeholder="Describe the value you provide..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* 2. Pricing & Logistics */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Pricing & Delivery
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Price (₹)
                </label>
                <input
                  type="number"
                  className="w-full p-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-green-500 outline-none font-black text-gray-900"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Timeline
                </label>
                <input
                  className="w-full p-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-gray-900"
                  value={formData.timeline}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Revisions
                </label>
                <input
                  type="number"
                  className="w-full p-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-gray-900"
                  value={formData.revisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      revisions: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* 3. Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Deliverables
                </h3>
                <button
                  type="button"
                  onClick={() => modifyArray("add", "deliverables")}
                  className="text-indigo-600 text-xs font-black hover:underline"
                >
                  + ADD
                </button>
              </div>
              <div className="space-y-2">
                {formData.deliverables.map((d, i) => (
                  <div key={i} className="flex gap-2 group">
                    <input
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium border border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all"
                      value={d}
                      placeholder="e.g. High Res Image"
                      onChange={(e) =>
                        handleArrayChange(i, e.target.value, "deliverables")
                      }
                    />
                    <button
                      type="button"
                      onClick={() => modifyArray("remove", "deliverables", i)}
                      className="text-gray-300 hover:text-red-500 p-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Requirements
                </h3>
                <button
                  type="button"
                  onClick={() => modifyArray("add", "requirements")}
                  className="text-orange-500 text-xs font-black hover:underline"
                >
                  + ADD
                </button>
              </div>
              <div className="space-y-2">
                {formData.requirements.map((r, i) => (
                  <div key={i} className="flex gap-2 group">
                    <input
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium border border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all"
                      value={r}
                      placeholder="e.g. Brand Logo"
                      onChange={(e) =>
                        handleArrayChange(i, e.target.value, "requirements")
                      }
                    />
                    <button
                      type="button"
                      onClick={() => modifyArray("remove", "requirements", i)}
                      className="text-gray-300 hover:text-red-500 p-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4 sticky bottom-0 z-10 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-[2] bg-gray-900 text-white py-4 rounded-xl font-black shadow-xl shadow-gray-300 hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            {initialData ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Campaigns;
