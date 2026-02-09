import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderModel: { type: String, enum: ["client", "Seller"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
      required: true,
      index: true,
    },
    sellerName: { type: String, required: true },
    platform: {
      type: String,
      enum: ["instagram", "youtube", "facebook", "twitter", "linkedin"],
      required: true,
    },
    serviceType: { type: String, required: true },
    serviceDetails: {
      amount: { type: Number, required: true },
      timeline: { type: String, required: true },
      revisions: { type: Number, default: 1 },
      deliverables: [String],
    },
    orderDetails: {
      brandName: { type: String, required: true },
      contactPerson: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      campaignBrief: { type: String, required: true },
      budget: { type: String, required: true },
      timeline: { type: String, required: true },
      specialRequirements: String,
      targetAudience: String,
      campaignGoals: String,
      contentGuidelines: String,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      unique: true,
      sparse: true,
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "requested",
        "rejected",
        "payment_pending",
        "active",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "requested",
      index: true,
    },
    chatHistory: [messageSchema],
    deliveryDate: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
