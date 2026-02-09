import mongoose from "mongoose";

const orderResolutionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    // Type determines the action
    type: {
      type: String,
      enum: ["review", "report", "refund_request"],
      required: true,
    },

    // For Reviews
    rating: { type: Number, min: 1, max: 5 }, // Only for 'review'

    // For Reports & Refunds
    reasonCategory: {
      type: String,
    },

    // Detailed comment for all types
    description: { type: String, required: true },

    // Admin Status
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed", "approved"],
      default: "pending",
    },

    adminRemarks: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("OrderResolution", orderResolutionSchema);
