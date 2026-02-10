import express from "express";
import {
  registerClient,
  loginClient,
  getClientProfile,
  getAllSellers,
  getSellerPublicProfile,
  getSellerReviews,
  createOrderRequest,
  getMyOrders,
  getOrderDetails,
  submitOrderResolution,
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
clientRouter.get("/seller/:id", clientAuth, getSellerPublicProfile); // <--- New Route for Overview
clientRouter.get("/seller/:id/reviews", clientAuth, getSellerReviews); // <--- New Route for Reviews

// --- Order Routes ---
// Updated path to match BookOrder.jsx frontend call
clientRouter.post("/order/create", clientAuth, createOrderRequest);
clientRouter.get("/my-orders", clientAuth, getMyOrders);
clientRouter.get("/order/:id", clientAuth, getOrderDetails);

// --- Resolution & Support ---
clientRouter.post("/order/resolution", clientAuth, submitOrderResolution);

// --- Payment & Chat Routes ---
clientRouter.post("/payment/initiate", clientAuth, initiatePayment);
clientRouter.post("/payment/verify", clientAuth, verifyPayment);
clientRouter.post("/payment/release-milestone", clientAuth, releaseMilestone);
clientRouter.get("/order/chat/:orderId", clientAuth, getChatHistory);

export default clientRouter;
