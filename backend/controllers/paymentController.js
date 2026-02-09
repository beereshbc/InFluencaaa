import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/adminModels/Order.js";
import Payment from "../models/adminModels/Payment.js";
import "dotenv/config";

// Initialize Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CLIENT PAYMENT FLOWS
// ==========================================

// @desc    1. Initialize Payment (Create Razorpay Order & DB Record)
// @route   POST /api/client/payment/initiate
export const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const clientId = req.clientId;

    // 1. Fetch Order
    const order = await Order.findOne({ _id: orderId, clientId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Validate Status
    if (order.status !== "payment_pending") {
      return res
        .status(400)
        .json({ success: false, message: "Order is not ready for payment" });
    }

    // 3. Check for existing Payment Record
    let paymentRecord;
    if (order.paymentId) {
      paymentRecord = await Payment.findById(order.paymentId);
      // If it exists and is already paid, stop.
      if (paymentRecord && paymentRecord.status === "captured") {
        return res
          .status(400)
          .json({ success: false, message: "Payment already completed" });
      }
    }

    // 4. Create Order on Razorpay
    // Amount must be in paise (INR * 100)
    const amountInPaise = Math.round(order.totalAmount * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        clientId: clientId.toString(),
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // 5. Create or Update Payment Record in DB
    if (!paymentRecord) {
      // Calculate Financials
      const platformFee = order.totalAmount * 0.1; // 10% Fee
      const sellerPayable = order.totalAmount - platformFee;

      paymentRecord = new Payment({
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        totalAmount: order.totalAmount,
        platformFee,
        sellerPayable,
        amountInEscrow: order.totalAmount,
        status: "created", // Initial status
      });

      await paymentRecord.save();

      // Link to Order
      order.paymentId = paymentRecord._id;
      await order.save();
    } else {
      // Update existing record with new Razorpay Order ID (retry scenario)
      paymentRecord.razorpayOrderId = razorpayOrder.id;
      paymentRecord.status = "created";
      await paymentRecord.save();
    }

    // 6. Send Response
    res.json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder,
      paymentRecordId: paymentRecord._id,
    });
  } catch (error) {
    console.error("Payment Init Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    2. Verify Payment Signature & Activate Order
// @route   POST /api/client/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Payment Signature" });
    }

    // 2. Find Payment Record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    // 3. Update Payment Status
    payment.paymentId = razorpay_payment_id;
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    // 4. Activate Order
    const order = await Order.findById(payment.orderId);
    order.status = "active";
    await order.save();

    res.json({
      success: true,
      message: "Payment Verified & Order Activated",
    });
  } catch (error) {
    console.error("Payment Verify Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    3. Client Releases Milestone Funds
// @route   POST /api/client/payment/release-milestone
export const releaseMilestone = async (req, res) => {
  try {
    const { paymentId, milestoneStep } = req.body;
    const clientId = req.clientId;

    // 1. Validations
    const payment = await Payment.findById(paymentId);
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    const order = await Order.findOne({ _id: payment.orderId, clientId });
    if (!order) return res.status(403).json({ message: "Unauthorized" });

    const milestoneIndex = payment.milestones.findIndex(
      (m) => m.step === milestoneStep,
    );
    if (milestoneIndex === -1)
      return res.status(404).json({ message: "Milestone not found" });

    const milestone = payment.milestones[milestoneIndex];

    if (milestone.status === "released")
      return res.status(400).json({ message: "Already released" });
    if (milestone.status === "locked")
      return res
        .status(400)
        .json({ message: "Previous milestone not completed" });

    // 2. Update Ledger
    milestone.status = "released";
    milestone.clientApproved = true;
    milestone.releasedAt = new Date();

    payment.amountInEscrow -= milestone.amount;
    payment.amountReleased += milestone.amount;

    // 3. Unlock Next Step or Complete Order
    if (milestoneStep < 5) {
      const nextMilestone = payment.milestones[milestoneIndex + 1];
      if (nextMilestone) nextMilestone.status = "pending_approval";
    } else {
      order.status = "completed";
      await order.save();
      payment.status = "settled";
    }

    await payment.save();

    res.json({ success: true, message: "Funds Released", data: payment });
  } catch (error) {
    console.error("Release Milestone Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// SELLER PAYMENT FLOWS
// ==========================================

// @desc    Seller Requests Milestone Release
// @route   POST /api/seller/payment/request-release
export const requestMilestoneRelease = async (req, res) => {
  try {
    const { paymentId, milestoneStep } = req.body;
    const sellerId = req.sellerId;

    // 1. Validations
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const order = await Order.findById(payment.orderId);
    if (!order || order.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const milestone = payment.milestones.find((m) => m.step === milestoneStep);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    if (milestone.status === "released")
      return res.status(400).json({ message: "Already released" });
    if (milestone.status === "pending_approval")
      return res.status(400).json({ message: "Already requested" });
    if (milestone.status === "locked")
      return res
        .status(400)
        .json({ message: "Previous milestone not completed" });

    // 2. Update State
    milestone.sellerRequest = true;
    milestone.status = "pending_approval";
    milestone.requestedAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message: "Release requested. Client notified.",
      data: payment,
    });
  } catch (error) {
    console.error("Request Release Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getChatHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select(
      "chatHistory",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, chat: order.chatHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
