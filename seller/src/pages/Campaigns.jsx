import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
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
  TrendingUp,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import { useSellerContext } from "../context/SellerContext";

// --- STATIC CONFIG ---
const STATIC_PLATFORMS = {
  instagram: {
    key: "instagram",
    icon: Instagram,
    color: "text-pink-500",
    bg: "bg-pink-50",
    border: "border-pink-500",
    label: "Instagram",
  },
  youtube: {
    key: "youtube",
    icon: Youtube,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-600",
    label: "YouTube",
  },
  twitter: {
    key: "twitter",
    icon: Twitter,
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-500",
    label: "Twitter",
  },
  linkedin: {
    key: "linkedin",
    icon: Linkedin,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-700",
    label: "LinkedIn",
  },
};

// --- MAIN COMPONENT ---
const Campaigns = () => {
  const { sellerData, axios, sellerToken } = useSellerContext();
  const [activeTab, setActiveTab] = useState("live");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null); // For Edit Mode
  const [isLoading, setIsLoading] = useState(true);

  const connectedPlatforms =
    sellerData?.connectedPlatforms?.map((p) => p.platform.toLowerCase()) || [];

  useEffect(() => {
    if (sellerToken) fetchCampaigns();
  }, [sellerToken]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get("/api/seller/campaigns", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      if (data.success) {
        setCampaigns(data.campaigns);
        if (!selectedPlatform && connectedPlatforms.length > 0) {
          setSelectedPlatform(connectedPlatforms[0]);
        }
      }
    } catch (err) {
      toast.error("Error loading packages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePackage = async (packageData) => {
    try {
      if (editingPackage) {
        // UPDATE EXISTING
        const { data } = await axios.put(
          `/api/seller/campaigns/package/${activeCampaign._id}/${editingPackage._id}`,
          packageData,
          { headers: { Authorization: `Bearer ${sellerToken}` } },
        );
        if (data.success) toast.success("Package updated!");
      } else {
        // CREATE NEW
        const { data } = await axios.post(
          "/api/seller/campaigns/add",
          { platform: selectedPlatform, newPackage: packageData },
          { headers: { Authorization: `Bearer ${sellerToken}` } },
        );
        if (data.success) toast.success("Package created!");
      }
      setShowModal(false);
      setEditingPackage(null);
      fetchCampaigns();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm("Delete this package?")) return;
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
    // Simple toggle via update endpoint
    try {
      await axios.put(
        `/api/seller/campaigns/package/${activeCampaign._id}/${pkg._id}`,
        { published: !pkg.published },
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );
      toast.success(pkg.published ? "Moved to Drafts" : "Published Live");
      fetchCampaigns();
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingPackage(null);
    setShowModal(true);
  };

  const activeCampaign = campaigns.find((c) => c.platform === selectedPlatform);
  const filteredPackages =
    activeCampaign?.packages?.filter((p) =>
      activeTab === "live" ? p.published : !p.published,
    ) || [];

  const platformConfig =
    STATIC_PLATFORMS[selectedPlatform] || STATIC_PLATFORMS.instagram;

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse">
        Loading Campaigns...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-4 md:px-8 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        {/* TOP HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              <Layers className="text-blue-600" /> Campaign Manager
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Manage your service cards and platform presence.
            </p>
          </div>

          {/* MINI NAVBAR */}
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex gap-1">
            {["live", "drafts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                {tab} (
                {activeCampaign?.packages?.filter((p) =>
                  tab === "live" ? p.published : !p.published,
                ).length || 0}
                )
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 space-y-2">
            {Object.values(STATIC_PLATFORMS).map((plat) => {
              const isConnected = connectedPlatforms.includes(plat.key);
              const isActive = selectedPlatform === plat.key;

              return (
                <button
                  key={plat.key}
                  disabled={!isConnected}
                  onClick={() => setSelectedPlatform(plat.key)}
                  className={`w-full group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 overflow-hidden ${
                    !isConnected
                      ? "opacity-40 grayscale cursor-not-allowed bg-gray-100"
                      : isActive
                        ? "bg-white shadow-lg"
                        : "bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  }`}
                >
                  {/* Active Border Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBorder"
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${plat.bg.replace("bg-", "bg-")}-500 rounded-l-xl`}
                    />
                  )}

                  <div
                    className={`p-2.5 rounded-lg ${isActive ? plat.bg + " " + plat.color : "bg-gray-100 text-gray-400"}`}
                  >
                    <plat.icon size={20} strokeWidth={2.5} />
                  </div>

                  <div className="text-left flex-1">
                    <span
                      className={`block font-bold text-sm ${isActive ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {plat.label}
                    </span>
                    {isConnected && isActive && (
                      <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                        Live
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-9">
            {!selectedPlatform ? (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">
                  Select a connected network
                </h3>
              </div>
            ) : (
              <div className="space-y-8">
                {/* PLATFORM STATS CARD */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 ${platformConfig.bg} rounded-bl-full opacity-50`}
                  />

                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-5 w-full">
                      <div className="h-16 w-16 rounded-full p-1 bg-gradient-to-tr from-gray-100 to-white shadow-inner">
                        <img
                          src={
                            activeCampaign?.profilePicture ||
                            "https://ui-avatars.com/api/?name=User"
                          }
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">
                          @{activeCampaign?.username || "user"}
                        </h2>
                        <div className="flex items-center gap-4 mt-1 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={14} className="text-blue-500" />{" "}
                            {activeCampaign?.followers?.toLocaleString() || 0}{" "}
                            Followers
                          </span>
                          <span className="flex items-center gap-1">
                            <ActivityRate
                              rate={activeCampaign?.engagementRate}
                            />{" "}
                            Engagement
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={openCreateModal}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Plus size={18} /> Create Package
                    </button>
                  </div>
                </div>

                {/* PACKAGES GRID */}
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {filteredPackages.length > 0 ? (
                      filteredPackages.map((pkg) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={pkg._id}
                          className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Left: Info */}
                            <div className="p-6 md:p-8 flex-1">
                              <div className="flex justify-between items-start mb-4">
                                <span
                                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${platformConfig.bg} ${platformConfig.color}`}
                                >
                                  {pkg.serviceType}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleTogglePublish(pkg)}
                                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500"
                                    title={
                                      pkg.published
                                        ? "Move to Drafts"
                                        : "Publish Live"
                                    }
                                  >
                                    {pkg.published ? (
                                      <EyeOff size={16} />
                                    ) : (
                                      <Eye size={16} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => openEditModal(pkg)}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-500"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePackage(pkg._id)}
                                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              <h3 className="text-xl font-black text-gray-900 mb-2">
                                {pkg.name}
                              </h3>
                              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                {pkg.description}
                              </p>

                              {/* Deliverables & Requirements */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-dashed border-gray-200">
                                <div>
                                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <CheckCircle
                                      size={14}
                                      className="text-green-500"
                                    />{" "}
                                    Deliverables
                                  </h4>
                                  <ul className="space-y-2">
                                    {pkg.deliverables?.map((d, i) => (
                                      <li
                                        key={i}
                                        className="text-sm text-gray-600 flex items-start gap-2"
                                      >
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300" />{" "}
                                        {d}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {pkg.requirements?.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                      <FileText
                                        size={14}
                                        className="text-orange-500"
                                      />{" "}
                                      Requirements
                                    </h4>
                                    <ul className="space-y-2">
                                      {pkg.requirements.map((r, i) => (
                                        <li
                                          key={i}
                                          className="text-sm text-gray-600 flex items-start gap-2"
                                        >
                                          <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-200" />{" "}
                                          {r}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Pricing & Meta */}
                            <div className="bg-gray-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center items-center text-center">
                              <div className="mb-4">
                                <span className="block text-3xl font-black text-gray-900">
                                  ₹{pkg.amount?.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  Starting Price
                                </span>
                              </div>

                              <div className="w-full space-y-3">
                                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                  <span className="text-xs font-bold text-gray-400 uppercase">
                                    Timeline
                                  </span>
                                  <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                    <Clock size={14} /> {pkg.timeline}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                  <span className="text-xs font-bold text-gray-400 uppercase">
                                    Revisions
                                  </span>
                                  <span className="text-sm font-bold text-gray-800">
                                    {pkg.revisions} Rounds
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-24 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          No {activeTab} packages
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Create a new package to get started on{" "}
                          {STATIC_PLATFORMS[selectedPlatform].label}
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REUSABLE MODAL FOR ADD & EDIT */}
      <AddEditPackageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePackage}
        platformName={STATIC_PLATFORMS[selectedPlatform]?.label}
        initialData={editingPackage} // Pass existing data if editing
      />
    </div>
  );
};

// --- HELPER: ENGAGEMENT RATE DISPLAY ---
const ActivityRate = ({ rate }) => {
  const num = rate ? Number(rate) : 0;
  return (
    <span
      className={`font-bold ${num > 3 ? "text-green-500" : "text-orange-500"}`}
    >
      {num.toFixed(1)}%
    </span>
  );
};

// --- MODAL COMPONENT (Reused for Create/Edit) ---
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

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset defaults
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

  const types = ["Post", "Video", "Story", "Reel", "Carousel", "Live Stream"];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {initialData ? "Edit Package" : `New ${platformName} Package`}
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {initialData
                ? "Update your offering"
                : "Define deliverables & pricing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          {/* Section 1: Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">
              1. BASIC DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Title
                </label>
                <input
                  required
                  className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold"
                  placeholder="e.g. Gold Tier Shoutout"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Type
                </label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold appearance-none"
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Description
              </label>
              <textarea
                required
                rows="2"
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
                placeholder="What value will the brand receive?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">
              2. LOGISTICS & PRICING
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-black text-lg"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Timeline
                </label>
                <input
                  className="w-full p-3 bg-gray-50 rounded-xl border-transparent outline-none font-bold text-sm"
                  value={formData.timeline}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Revisions
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-gray-50 rounded-xl border-transparent outline-none font-bold text-sm"
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

          {/* Section 3: Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-sm font-black text-gray-900">
                  DELIVERABLES
                </h3>
                <button
                  type="button"
                  onClick={() => modifyArray("add", "deliverables")}
                  className="text-blue-600 text-xs font-black hover:underline"
                >
                  + ADD ITEM
                </button>
              </div>
              {formData.deliverables.map((d, i) => (
                <div key={i} className="flex gap-2 group">
                  <input
                    className="flex-1 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none text-sm py-1"
                    value={d}
                    placeholder="Item..."
                    onChange={(e) =>
                      handleArrayChange(i, e.target.value, "deliverables")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => modifyArray("remove", "deliverables", i)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-sm font-black text-gray-900">
                  REQUIREMENTS
                </h3>
                <button
                  type="button"
                  onClick={() => modifyArray("add", "requirements")}
                  className="text-orange-500 text-xs font-black hover:underline"
                >
                  + ADD ITEM
                </button>
              </div>
              {formData.requirements.map((r, i) => (
                <div key={i} className="flex gap-2 group">
                  <input
                    className="flex-1 bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none text-sm py-1"
                    value={r}
                    placeholder="Req..."
                    onChange={(e) =>
                      handleArrayChange(i, e.target.value, "requirements")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => modifyArray("remove", "requirements", i)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t bg-gray-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] bg-black text-white py-4 rounded-xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            {initialData ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Campaigns;
