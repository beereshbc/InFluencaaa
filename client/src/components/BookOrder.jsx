import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Briefcase,
  User,
  Target,
  CheckCircle2,
  Send, // Changed icon
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { useClientContext } from "../context/ClientContext";

const BookOrder = ({ isOpen, onClose, packageData, seller, platform }) => {
  const { axios, clientToken, clientData } = useClientContext();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    brandName: clientData?.brandName || "",
    contactPerson: clientData?.name || "",
    email: clientData?.email || "",
    phone: "",
    campaignBrief: "",
    budget: packageData?.amount?.toString() || "",
    timeline: packageData?.timeline || "",
    specialRequirements: "",
    targetAudience: "",
    campaignGoals: "",
    contentGuidelines: "",
  });

  if (!isOpen || !packageData) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      sellerId: seller._id,
      sellerName: seller.fullName,
      platform: platform,
      serviceType: packageData.serviceType,

      serviceDetails: {
        service: packageData.serviceType,
        amount: packageData.amount,
        timeline: packageData.timeline || "3 Days",
        revisions: packageData.revisions || 1,
        description: packageData.description || "",
        deliverables: packageData.deliverables || [],
      },

      orderDetails: {
        brandName: formData.brandName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        campaignBrief: formData.campaignBrief,
        budget: formData.budget,
        timeline: formData.timeline,
        specialRequirements: formData.specialRequirements,
        targetAudience: formData.targetAudience,
        campaignGoals: formData.campaignGoals,
        contentGuidelines: formData.contentGuidelines,
      },

      totalAmount: packageData.amount,
    };

    try {
      // UPDATED ENDPOINT HERE 👇
      const { data } = await axios.post("/api/client/create-order", payload, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });

      if (data.success) {
        toast.success("Request sent! Waiting for seller approval.");
        onClose();
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="text-indigo-600" />
                Request Campaign
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {packageData.serviceType} with{" "}
                <span className="font-bold text-gray-700">
                  {seller.fullName}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <form id="orderForm" onSubmit={handleSubmit} className="space-y-8">
              {/* Notice Box */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                <Info className="text-blue-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-800">
                    No Payment Required Yet
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Your request will be sent to the seller. Once they review
                    and accept your brief, you will receive a payment link to
                    start the order securely via Escrow.
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <User size={16} /> Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Brand Name
                    </label>
                    <input
                      required
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all"
                      placeholder="Your Brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Contact Person
                    </label>
                    <input
                      required
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Phone
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Target size={16} /> Campaign Brief
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Campaign Goal
                  </label>
                  <textarea
                    required
                    name="campaignBrief"
                    value={formData.campaignBrief}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Describe what you want to achieve..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Target Audience
                    </label>
                    <input
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none"
                      placeholder="e.g. Gen Z, Tech Enthusiasts"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Content Guidelines
                    </label>
                    <input
                      name="contentGuidelines"
                      value={formData.contentGuidelines}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none"
                      placeholder="Do's and Don'ts link"
                    />
                  </div>
                </div>
              </div>

              {/* Est. Cost Box */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 opacity-80">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-gray-500">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Estimated Cost
                    </p>
                    <p className="text-2xl font-black text-gray-700">
                      ₹{packageData.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs font-medium text-gray-500">
                    Payment due ONLY after seller acceptance
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="orderForm"
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>Sending...</>
              ) : (
                <>
                  Send Request <Send size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookOrder;
