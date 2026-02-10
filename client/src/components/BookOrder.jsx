import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Briefcase,
  User,
  Target,
  CheckCircle2,
  Send,
  Info,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useClientContext } from "../context/ClientContext";

const BookOrder = ({ isOpen, onClose, packageData, seller, platform }) => {
  const { axios, clientToken, clientData, navigate } = useClientContext();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    brandName: clientData?.brandName || "",
    contactPerson: clientData?.name || "",
    email: clientData?.email || "",
    phone: "",
    campaignBrief: "",
    budget: packageData?.amount?.toString() || "",
    timeline: packageData?.timeline || "3 Days",
    specialRequirements: "",
    targetAudience: "",
    campaignGoals: "",
    contentGuidelines: "",
  });

  if (!isOpen || !packageData) return null;

  const totalSteps = 3;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (
        !formData.brandName ||
        !formData.contactPerson ||
        !formData.email ||
        !formData.phone
      ) {
        toast.error("Please fill all contact details");
        return false;
      }
    }
    if (currentStep === 2) {
      if (
        !formData.campaignGoals ||
        !formData.targetAudience ||
        !formData.campaignBrief
      ) {
        toast.error("Please fill campaign strategy details");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending request...");

    const payload = {
      sellerId: seller._id,
      sellerName: seller.fullName,
      platform: platform,
      serviceType: packageData.serviceType,
      totalAmount: packageData.amount,

      serviceDetails: {
        amount: packageData.amount,
        timeline: packageData.timeline || "3 Days",
        revisions: packageData.revisions || 1,
        deliverables: packageData.deliverables || [],
      },

      orderDetails: {
        brandName: formData.brandName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        campaignBrief: formData.campaignBrief,
        budget: formData.budget, // Keep budget consistent with package price
        timeline: formData.timeline, // Keep timeline consistent
        specialRequirements: formData.specialRequirements,
        targetAudience: formData.targetAudience,
        campaignGoals: formData.campaignGoals,
        contentGuidelines: formData.contentGuidelines,
      },
    };

    try {
      const { data } = await axios.post("/api/client/order/create", payload, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });

      if (data.success) {
        toast.success("Request sent! Check your Dashboard.", {
          id: loadingToast,
        });
        onClose();
        navigate("/dashboard"); // Redirect to dashboard to see the new request
      } else {
        toast.error(data.message || "Failed to send request", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-gray-900/60 backdrop-blur-sm">
        {/* Backdrop Click to Close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full md:max-w-2xl bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[85vh]"
        >
          {/* --- HEADER --- */}
          <div className="bg-white border-b border-gray-100 p-5 md:p-6 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                <Briefcase className="text-indigo-600" size={20} />
                Book {packageData.name || "Campaign"}
              </h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Step {step} of {totalSteps} • @{seller.fullName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- PROGRESS BAR --- */}
          <div className="h-1 bg-gray-100 w-full">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* --- SCROLLABLE BODY --- */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#F8FAFC]">
            <AnimatePresence mode="wait">
              {/* STEP 1: CONTACT INFO */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3">
                    <Info className="text-indigo-600 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-bold text-indigo-900">
                        No Immediate Payment
                      </p>
                      <p className="text-xs text-indigo-700 mt-0.5">
                        Your request will be sent for review. Payment is only
                        required after the creator accepts.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                        Brand Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corp"
                        className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-gray-900 shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        placeholder="Your Name"
                        className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@company.com"
                          className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CAMPAIGN STRATEGY */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-black text-gray-900">
                      STRATEGY & GOALS
                    </h3>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Campaign Goal <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="campaignGoals"
                      value={formData.campaignGoals}
                      onChange={handleChange}
                      className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm transition-all"
                    >
                      <option value="">Select a Goal</option>
                      <option value="Brand Awareness">Brand Awareness</option>
                      <option value="Sales / Conversions">
                        Sales / Conversions
                      </option>
                      <option value="App Installs">App Installs</option>
                      <option value="User Generated Content">
                        UGC / Content Creation
                      </option>
                      <option value="Event Promotion">Event Promotion</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      placeholder="e.g. Gen Z, Tech Enthusiasts, Bangalore"
                      className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Campaign Brief <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="campaignBrief"
                      rows={5}
                      value={formData.campaignBrief}
                      onChange={handleChange}
                      placeholder="Describe your product, key message, and what you expect the creator to do."
                      className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm resize-none transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CONTENT & REVIEW */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-black text-gray-900">
                      CONTENT SPECIFICS
                    </h3>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Content Guidelines (Optional)
                    </label>
                    <textarea
                      name="contentGuidelines"
                      rows={2}
                      value={formData.contentGuidelines}
                      onChange={handleChange}
                      placeholder="Dos and Don'ts, visual style preference, etc."
                      className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Special Requirements (Optional)
                    </label>
                    <input
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleChange}
                      placeholder="e.g. Need raw files, specific hashtags"
                      className="w-full mt-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-gray-900 shadow-sm transition-all"
                    />
                  </div>

                  {/* Summary Box */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <CreditCard size={14} /> Order Summary
                    </h4>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600 font-medium">
                        Service Cost
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{packageData.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-600 font-medium">
                        Platform Fee (Escrow)
                      </span>
                      <span className="font-bold text-green-600">INCLUDED</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-black text-gray-900">
                        Total Budget
                      </span>
                      <span className="font-black text-xl text-indigo-600">
                        ₹{packageData.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- FOOTER ACTIONS --- */}
          <div className="p-5 border-t border-gray-100 bg-white flex justify-between items-center sticky bottom-0 z-20">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3.5 text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-8 py-3.5 bg-black text-white font-bold text-sm rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Confirm & Request"}{" "}
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookOrder;
