import express from "express";
import {
  registerClient,
  loginClient,
  getClientProfile,
  getAllSellers,
  createOrderRequest,
  getMyOrders,
  getOrderDetails,
} from "../controllers/clientController.js";
import {
  initiatePayment,
  verifyPayment,
  releaseMilestone,
  getChatHistory,
} from "../controllers/paymentController.js";
import clientAuth from "../middlewares/clientAuth.js";

const clientRouter = express.Router();

// --- Auth Routes ---
clientRouter.post("/register", registerClient);
clientRouter.post("/login", loginClient);
clientRouter.get("/get-profile", clientAuth, getClientProfile);

// --- Seller & Marketplace Routes ---
clientRouter.get("/all-sellers", clientAuth, getAllSellers);

// --- Order Routes ---
clientRouter.post("/create-order", clientAuth, createOrderRequest); // Create Request
clientRouter.get("/my-orders", clientAuth, getMyOrders); // List all
clientRouter.get("/order/:id", clientAuth, getOrderDetails); // Get single details

// --- Payment Routes ---
clientRouter.post("/payment/initiate", clientAuth, initiatePayment); // Step 1: Open Gateway
clientRouter.post("/payment/verify", clientAuth, verifyPayment); // Step 2: Confirm & Create Ledger
clientRouter.post("/payment/release-milestone", clientAuth, releaseMilestone); // Step 3: Release Funds
clientRouter.get("/order/chat/:orderId", clientAuth, getChatHistory);

export default clientRouter;
