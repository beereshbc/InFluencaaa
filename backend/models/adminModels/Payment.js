import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  sellerRequest: { type: Boolean, default: false },
  clientApproved: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["locked", "pending_approval", "released", "refunded"],
    default: "locked",
  },
  requestedAt: Date,
  releasedAt: Date,
  refundedAt: Date,
  payoutTxnId: { type: String, default: null },
  refundTxnId: { type: String, default: null },
});

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    sellerPayable: { type: Number, required: true },
    amountInEscrow: { type: Number, required: true },
    amountReleased: { type: Number, default: 0 },
    amountRefunded: { type: Number, default: 0 },
    milestones: [milestoneSchema],
    status: {
      type: String,
      enum: [
        "created",
        "captured",
        "failed",
        "partially_refunded",
        "fully_refunded",
        "settled",
      ],
      default: "created",
    },
  },
  { timestamps: true },
);

paymentSchema.pre("save", async function () {
  if (this.isNew && this.milestones.length === 0) {
    const share = this.sellerPayable / 5;

    this.milestones = [
      {
        step: 1,
        name: "Order Acceptance & Kickoff",
        amount: share,
        status: "pending_approval",
      },
      {
        step: 2,
        name: "Draft / Concept Review",
        amount: share,
        status: "locked",
      },
      {
        step: 3,
        name: "First Cut Delivery",
        amount: share,
        status: "locked",
      },
      {
        step: 4,
        name: "Final Polish & Changes",
        amount: share,
        status: "locked",
      },
      {
        step: 5,
        name: "Final Assets Delivery",
        amount: share,
        status: "locked",
      },
    ];

    this.amountInEscrow = this.totalAmount;
  }
});

export default mongoose.model("Payment", paymentSchema);
