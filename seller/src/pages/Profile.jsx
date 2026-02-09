import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Globe,
  Camera,
  Loader2,
  ChevronDown,
  CreditCard,
  Landmark,
  BadgeIndianRupee,
  Building,
  Save,
  ShieldCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSellerContext } from "../context/SellerContext";

const Profile = () => {
  const { sellerData, sellerToken, axios, getSellerProfile } =
    useSellerContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // State handles top-level fields
  const [tempData, setTempData] = useState({});
  // New State handles nested payout details
  const [payoutData, setPayoutData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  const [files, setFiles] = useState({ thumbnail: null, coverImage: null });

  const niches = [
    "Fashion & Lifestyle",
    "Tech & Gaming",
    "Food & Beverage",
    "Travel",
    "Fitness & Health",
    "Beauty & Makeup",
    "Education",
    "Entertainment",
    "Finance",
    "Other",
  ];

  // Initialize Data
  useEffect(() => {
    if (sellerData) {
      setTempData({
        ...sellerData,
        languages: sellerData.languages?.join(", "),
      });

      // Populate payout details if they exist, otherwise empty strings
      if (sellerData.payoutDetails) {
        setPayoutData({
          accountHolderName: sellerData.payoutDetails.accountHolderName || "",
          bankName: sellerData.payoutDetails.bankName || "",
          accountNumber: sellerData.payoutDetails.accountNumber || "",
          ifscCode: sellerData.payoutDetails.ifscCode || "",
          upiId: sellerData.payoutDetails.upiId || "",
        });
      }
    }
  }, [sellerData]);

  // Handle Input Changes
  const handlePayoutChange = (e) => {
    setPayoutData({ ...payoutData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    // 1. Append Top Level Fields
    Object.keys(tempData).forEach((key) => {
      if (
        ![
          "thumbnail",
          "coverImage",
          "audience",
          "rating",
          "email",
          "_id",
          "createdAt",
          "updatedAt",
          "__v",
          "payoutDetails",
          "connectedPlatforms",
        ].includes(key)
      ) {
        formData.append(key, tempData[key]);
      }
    });

    // 2. Append Nested Payout Details (As JSON string is easiest for Multer)
    formData.append("payoutDetails", JSON.stringify(payoutData));

    // 3. Append Images
    if (files.thumbnail) formData.append("thumbnail", files.thumbnail);
    if (files.coverImage) formData.append("coverImage", files.coverImage);

    try {
      const { data } = await axios.post(
        "/api/seller/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${sellerToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        toast.success("Profile Updated Successfully");
        setIsEditing(false);
        getSellerProfile(); // Refresh context data
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!sellerData)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-28 px-4 md:px-8 font-sans">
      <Toaster position="top-center" />
      <form onSubmit={handleUpdate} className="max-w-5xl mx-auto space-y-8">
        {/* --- BANNER & HEADER --- */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-48 md:h-64 w-full relative group bg-gray-200">
            <img
              src={
                files.coverImage
                  ? URL.createObjectURL(files.coverImage)
                  : sellerData.coverImage ||
                    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000"
              }
              className="w-full h-full object-cover"
              alt="Cover"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                <div className="bg-white/20 p-3 rounded-full border border-white/50">
                  <Camera className="text-white" size={32} />
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    setFiles({ ...files, coverImage: e.target.files[0] })
                  }
                />
              </label>
            )}
          </div>

          <div className="px-6 md:px-10 pb-8">
            <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-16 mb-2">
              <div className="relative group">
                <img
                  src={
                    files.thumbnail
                      ? URL.createObjectURL(files.thumbnail)
                      : sellerData.thumbnail ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=Default"
                  }
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white shadow-2xl bg-white object-cover"
                  alt="Profile"
                />
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Camera className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setFiles({ ...files, thumbnail: e.target.files[0] })
                      }
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 pb-2 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  {sellerData.fullName}
                </h1>
                <p className="text-primary font-bold text-lg">
                  {sellerData.niche}
                </p>
              </div>

              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isEditing
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: PERSONAL INFO --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Basic Info Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6">
                <User size={20} className="text-primary" /> Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    Full Name
                  </label>
                  <input
                    disabled={!isEditing}
                    value={tempData.fullName || ""}
                    onChange={(e) =>
                      setTempData({ ...tempData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    Niche
                  </label>
                  <div className="relative">
                    <select
                      disabled={!isEditing}
                      value={tempData.niche || "General"}
                      onChange={(e) =>
                        setTempData({ ...tempData, niche: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {niches.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-4 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    Bio
                  </label>
                  <textarea
                    disabled={!isEditing}
                    rows="4"
                    value={tempData.bio || ""}
                    onChange={(e) =>
                      setTempData({ ...tempData, bio: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* 2. Bank Details Card (New) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Landmark size={20} className="text-primary" /> Bank Account &
                  Payouts
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                  <ShieldCheck size={14} />
                  Secure & Encrypted
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                    <User size={12} /> Account Holder Name
                  </label>
                  <input
                    disabled={!isEditing}
                    name="accountHolderName"
                    value={payoutData.accountHolderName}
                    onChange={handlePayoutChange}
                    placeholder="As per passbook"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 font-medium disabled:opacity-70"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                    <Building size={12} /> Bank Name
                  </label>
                  <input
                    disabled={!isEditing}
                    name="bankName"
                    value={payoutData.bankName}
                    onChange={handlePayoutChange}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 font-medium disabled:opacity-70"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                    <CreditCard size={12} /> Account Number
                  </label>
                  <input
                    disabled={!isEditing}
                    name="accountNumber"
                    value={payoutData.accountNumber}
                    onChange={handlePayoutChange}
                    type="password" // Masked for basic visual security
                    placeholder="XXXX XXXX XXXX"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 font-medium disabled:opacity-70"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    IFSC Code
                  </label>
                  <input
                    disabled={!isEditing}
                    name="ifscCode"
                    value={payoutData.ifscCode}
                    onChange={handlePayoutChange}
                    placeholder="HDFC0001234"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 font-medium disabled:opacity-70 uppercase"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                    <BadgeIndianRupee size={12} /> UPI ID (Optional)
                  </label>
                  <input
                    disabled={!isEditing}
                    name="upiId"
                    value={payoutData.upiId}
                    onChange={handlePayoutChange}
                    placeholder="username@okhdfcbank"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 font-medium disabled:opacity-70"
                  />
                </div>
              </div>
            </div>

            {/* Save Button (Bottom) */}
            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> Save All Changes
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* --- RIGHT COLUMN: CONTACT & READ-ONLY --- */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
                <Globe size={18} className="text-primary" /> Contact & Meta
              </h3>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Location
                  </label>
                  <input
                    disabled={!isEditing}
                    value={tempData.location || ""}
                    onChange={(e) =>
                      setTempData({ ...tempData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none border border-transparent focus:border-primary/20 focus:bg-white transition-all disabled:bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Phone
                  </label>
                  <input
                    disabled={!isEditing}
                    value={tempData.phone || ""}
                    onChange={(e) =>
                      setTempData({ ...tempData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none border border-transparent focus:border-primary/20 focus:bg-white transition-all disabled:bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Languages
                  </label>
                  <input
                    disabled={!isEditing}
                    value={tempData.languages || ""}
                    onChange={(e) =>
                      setTempData({ ...tempData, languages: e.target.value })
                    }
                    placeholder="English, Hindi, etc."
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none border border-transparent focus:border-primary/20 focus:bg-white transition-all disabled:bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Read-only Badge */}
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex flex-col items-center text-center">
              <ShieldCheck size={32} className="text-primary mb-2" />
              <p className="text-sm font-bold text-gray-800">Verified Seller</p>
              <p className="text-xs text-gray-500 mt-1">
                Your profile details are secure.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
