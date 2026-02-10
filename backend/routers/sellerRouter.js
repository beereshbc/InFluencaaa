import express from "express";
import {
  acceptOrderRequest,
  addCampaignPackage,
  deleteCampaignPackage,
  deletePortfolioImage,
  getLinkedinAuthUrl,
  getMyOrders,
  getProfile,
  getSellerAnalytics,
  getSellerCampaigns,
  getSellerEarnings,
  getSellerOrderDetails,
  getTwitterAuthUrl,
  getYoutubeAuthUrl,
  linkedinCallback,
  loginSeller,
  registerSeller,
  rejectOrderRequest,
  requestWithdrawal,
  syncPlatform,
  twitterCallback,
  updateCampaignPackage,
  updateProfile,
  uploadPortfolioImages,
  youtubeCallback,
} from "../controllers/sellerController.js";
import sellerAuth from "../middlewares/sellerAuth.js";
import upload from "../middlewares/multer.js";
import { requestMilestoneRelease } from "../controllers/paymentController.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", loginSeller);
sellerRouter.post("/register", registerSeller);
sellerRouter.get("/profile", sellerAuth, getProfile);
sellerRouter.post(
  "/update-profile",
  sellerAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile,
);
sellerRouter.get("/auth/youtube/init", sellerAuth, getYoutubeAuthUrl);
sellerRouter.get("/auth/youtube/callback", youtubeCallback);
sellerRouter.post("/sync-platform", sellerAuth, syncPlatform);
sellerRouter.get("/auth/twitter/init", sellerAuth, getTwitterAuthUrl);
sellerRouter.get("/auth/twitter/callback", twitterCallback);
sellerRouter.get("/auth/linkedin/init", sellerAuth, getLinkedinAuthUrl);
sellerRouter.get("/auth/linkedin/callback", linkedinCallback);
sellerRouter.get("/campaigns", sellerAuth, getSellerCampaigns);
sellerRouter.post("/campaigns/add", sellerAuth, addCampaignPackage);
sellerRouter.put(
  "/campaigns/package/:campaignId/:packageId",
  sellerAuth,
  updateCampaignPackage,
);
sellerRouter.delete(
  "/campaigns/package/:campaignId/:packageId",
  sellerAuth,
  deleteCampaignPackage,
);
sellerRouter.get("/my-orders", sellerAuth, getMyOrders);
sellerRouter.get("/order/:id", sellerAuth, getSellerOrderDetails);
sellerRouter.put("/order/:id/accept", sellerAuth, acceptOrderRequest);
sellerRouter.put("/order/:id/reject", sellerAuth, rejectOrderRequest);
sellerRouter.get("/earnings", sellerAuth, getSellerEarnings);
sellerRouter.get("/analytics", sellerAuth, getSellerAnalytics);

// --- Payments ---
sellerRouter.post(
  "/payment/request-release",
  sellerAuth,
  requestMilestoneRelease,
);
sellerRouter.get("/earnings", sellerAuth, getSellerEarnings);
sellerRouter.post("/withdraw", sellerAuth, requestWithdrawal);
sellerRouter.post(
  "/portfolio/add",
  sellerAuth,
  upload.array("images", 5),
  uploadPortfolioImages,
);
sellerRouter.put("/portfolio/remove", sellerAuth, deletePortfolioImage);
export default sellerRouter;
