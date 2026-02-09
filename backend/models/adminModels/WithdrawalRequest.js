import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    payoutDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      upiId: String,
    },
    adminNote: { type: String },
    transactionId: { type: String }, // Bank Ref ID after approval
    processedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
