import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/SellerModels/Seller.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { TwitterApi } from "twitter-api-v2";
import { google } from "googleapis";
import axios from "axios";
import Campaign from "../models/SellerModels/Campaign.js";
import Order from "../models/adminModels/Order.js";
import Payment from "../models/adminModels/Payment.js";

export const registerSeller = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(409).json({
        success: false,
        message: "Seller already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const seller = await Seller.findById(sellerId);
    if (!seller)
      return res.json({ success: false, message: "Profile not found" });

    res.json({ success: true, data: seller });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    // 1. Create a clean updates object
    let updates = { ...req.body };

    // 2. Define Forbidden Fields (Security)
    const notAllowed = [
      "_id",
      "email",
      "password",
      "isBlocked",
      "rating",
      "connectedPlatforms",
      "totalFollowers",
      "avgEngagementRate",
      "audience",
      "totalReviews",
      "createdAt",
      "updatedAt",
      "__v",
    ];

    // 3. Remove Forbidden Fields
    notAllowed.forEach((field) => delete updates[field]);

    // 4. Handle Payout Details Security
    // If payoutDetails are being updated, ensure 'isVerified' cannot be changed by the user
    if (updates.payoutDetails) {
      // If it came as a string (from FormData), parse it
      if (typeof updates.payoutDetails === "string") {
        try {
          updates.payoutDetails = JSON.parse(updates.payoutDetails);
        } catch (e) {
          // If parse fails, assume it's malformed and delete it
          delete updates.payoutDetails;
        }
      }

      // Force isVerified to false if sensitive fields change (requiring re-verification)
      // Or simply prevent them from setting it to true.
      // Here we just delete it so they can't overwrite the admin's setting.
      if (updates.payoutDetails) {
        delete updates.payoutDetails.isVerified;

        // Optional: Reset verification if account number changes
        // updates.payoutDetails.isVerified = false;
      }
    }

    // 5. Handle File Uploads (Images)
    if (req.files) {
      try {
        if (req.files.thumbnail?.[0]) {
          const result = await cloudinary.uploader.upload(
            req.files.thumbnail[0].path,
            {
              folder: "sellers/thumbnails",
            },
          );
          updates.thumbnail = result.secure_url;
          if (fs.existsSync(req.files.thumbnail[0].path))
            fs.unlinkSync(req.files.thumbnail[0].path);
        }

        if (req.files.coverImage?.[0]) {
          const result = await cloudinary.uploader.upload(
            req.files.coverImage[0].path,
            {
              folder: "sellers/covers",
            },
          );
          updates.coverImage = result.secure_url;
          if (fs.existsSync(req.files.coverImage[0].path))
            fs.unlinkSync(req.files.coverImage[0].path);
        }
      } catch (uploadError) {
        // Cleanup temp files on failure
        Object.values(req.files)
          .flat()
          .forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        return res.status(500).json({
          success: false,
          message: "Image upload failed: " + uploadError.message,
        });
      }
    }

    // 6. Handle Languages Array
    if (updates.languages && typeof updates.languages === "string") {
      updates.languages = updates.languages
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    }

    // 7. Perform the Database Update
    // Using simple $set. Since payoutDetails is nested in the schema,
    // Mongoose handles the object replacement.
    // Note: This replaces the WHOLE payoutDetails object.
    // To update partial fields, we would need to flatten the object (payoutDetails.bankName).
    // For a profile form, replacing the object with the new form state is usually intended.

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -payoutDetails.isVerified"); // Don't send back sensitive flag if not needed

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedSeller,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  process.env.YT_REDIRECT_URI,
);
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

export const getYoutubeAuthUrl = async (req, res) => {
  try {
    // Generate the URL with the sellerId as 'state'
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/youtube.readonly"],
      state: req.sellerId,
    });
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getTwitterAuthUrl = async (req, res) => {
  try {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      process.env.TWITTER_REDIRECT_URI,
      { scope: ["users.read", "tweet.read", "offline.access"] },
    );

    // Save verifier and state to the logged-in seller
    await Seller.findByIdAndUpdate(req.sellerId, {
      twitterOAuth: { codeVerifier, state },
    });

    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getLinkedinAuthUrl = async (req, res) => {
  try {
    const rootUrl = "https://www.linkedin.com/oauth/v2/authorization";
    const options = {
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      state: req.sellerId,
      scope: "openid profile email", // Ensure "Community Management" product is added in portal
    };

    const qs = new URLSearchParams(options).toString();
    res.json({ success: true, url: `${rootUrl}?${qs}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const youtubeCallback = async (req, res) => {
  const { code, state: sellerId } = req.query;
  if (!code || !sellerId) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/seller/connect?error=missing_params`,
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.channels.list({
      part: "snippet,statistics",
      mine: true,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("No YouTube channel found.");
    }

    const channel = response.data.items[0];
    const stats = channel.statistics;

    const platformData = {
      platform: "YouTube",
      username: channel.snippet.title,
      platformId: channel.id,
      profilePicture:
        channel.snippet.thumbnails.high?.url ||
        channel.snippet.thumbnails.default.url,
      // UPDATED: Save tokens for the sync function
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      stats: {
        followers: stats.hiddenSubscriberCount
          ? 0
          : Number(stats.subscriberCount) || 0,
        postsCount: Number(stats.videoCount) || 0,
        reach: Number(stats.viewCount) || 0,
      },
      lastSynced: new Date(),
    };

    const seller = await Seller.findById(sellerId);
    if (!seller) throw new Error("Seller not found");

    const existingIdx = seller.connectedPlatforms.findIndex(
      (p) => p.platform === "YouTube",
    );
    if (existingIdx > -1) {
      seller.connectedPlatforms[existingIdx] = platformData;
    } else {
      seller.connectedPlatforms.push(platformData);
    }

    seller.totalFollowers = seller.connectedPlatforms.reduce(
      (acc, curr) => acc + (Number(curr.stats.followers) || 0),
      0,
    );

    // Explicitly mark modified because we are updating an object within an array
    seller.markModified("connectedPlatforms");
    await seller.save();

    res.redirect(`${process.env.FRONTEND_URL}/seller/connect?success=true`);
  } catch (error) {
    console.error("YouTube OAuth Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/seller/connect?error=true`);
  }
};

export const twitterCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const seller = await Seller.findOne({ "twitterOAuth.state": state });
    if (!seller || !seller.twitterOAuth.codeVerifier) {
      throw new Error("Invalid OAuth session.");
    }

    const { client: loggedClient, accessToken } =
      await twitterClient.loginWithOAuth2({
        code,
        codeVerifier: seller.twitterOAuth.codeVerifier,
        redirectUri: process.env.TWITTER_REDIRECT_URI,
      });

    const { data: user } = await loggedClient.v2.me({
      "user.fields": ["public_metrics", "profile_image_url", "verified"],
    });

    const platformData = {
      platform: "Twitter",
      username: user.username,
      platformId: user.id,
      isVerified: user.verified,
      profilePicture: user.profile_image_url,
      // UPDATED: Save accessToken for sync
      accessToken: accessToken,
      stats: {
        followers: user.public_metrics.followers_count || 0,
        postsCount: user.public_metrics.tweet_count || 0,
        reach: user.public_metrics.followers_count || 0,
      },
      lastSynced: new Date(),
    };

    const existingIdx = seller.connectedPlatforms.findIndex(
      (p) => p.platform === "Twitter",
    );
    if (existingIdx > -1) {
      seller.connectedPlatforms[existingIdx] = platformData;
    } else {
      seller.connectedPlatforms.push(platformData);
    }

    seller.twitterOAuth = undefined; // Cleanup temp PKCE data
    seller.totalFollowers = seller.connectedPlatforms.reduce(
      (acc, curr) => acc + (curr.stats.followers || 0),
      0,
    );

    seller.markModified("connectedPlatforms");
    await seller.save();
    res.redirect(`${process.env.FRONTEND_URL}/seller/connect?success=true`);
  } catch (error) {
    console.error("Twitter OAuth Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/seller/connect?error=true`);
  }
};

export const linkedinCallback = async (req, res) => {
  const { code, state: sellerId } = req.query;

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const user = profileResponse.data;

    let followerCount = 0;
    try {
      const statsResponse = await axios.get(
        "https://api.linkedin.com/rest/memberFollowersCount?q=me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
            "Linkedin-Version": "202502",
          },
        },
      );
      followerCount = statsResponse.data.elements?.[0]?.followerCount || 0;
    } catch (err) {
      console.warn("LinkedIn stats restricted.");
    }

    const platformData = {
      platform: "LinkedIn",
      username: user.name || `${user.given_name} ${user.family_name}`,
      platformId: user.sub,
      profilePicture: user.picture,
      // UPDATED: Save accessToken for sync
      accessToken: accessToken,
      stats: {
        followers: followerCount,
        postsCount: 0,
        reach: followerCount,
      },
      lastSynced: new Date(),
    };

    const seller = await Seller.findById(sellerId);
    if (!seller) throw new Error("Seller not found");

    const existingIdx = seller.connectedPlatforms.findIndex(
      (p) => p.platform === "LinkedIn",
    );
    if (existingIdx > -1) {
      seller.connectedPlatforms[existingIdx] = platformData;
    } else {
      seller.connectedPlatforms.push(platformData);
    }

    seller.markModified("connectedPlatforms");
    await seller.save();

    res.redirect(`${process.env.FRONTEND_URL}/seller/connect?success=true`);
  } catch (error) {
    console.error("LinkedIn Update Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/seller/connect?error=true`);
  }
};

export const syncPlatform = async (req, res) => {
  try {
    const { platform } = req.body;
    const sellerId = req.sellerId;

    // 1. Validate supported platforms
    const supportedPlatforms = ["YouTube", "Twitter", "LinkedIn"];
    if (!supportedPlatforms.includes(platform)) {
      return res.json({
        success: false,
        message: `Syncing for ${platform} is coming soon!`,
      });
    }

    // 2. Find seller and include hidden tokens
    const seller = await Seller.findById(sellerId).select(
      "+connectedPlatforms.accessToken +connectedPlatforms.refreshToken",
    );
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    const account = seller.connectedPlatforms.find(
      (p) => p.platform === platform,
    );
    if (!account || !account.accessToken) {
      return res.json({
        success: false,
        message: `${platform} not connected. Please reconnect.`,
      });
    }

    let updatedStats = {};

    // 3. Platform-specific API fetching
    if (platform === "YouTube") {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YT_CLIENT_ID,
        process.env.YT_CLIENT_SECRET,
      );
      oauth2Client.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
      });

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });
      const response = await youtube.channels.list({
        part: "statistics",
        mine: true,
      });

      const stats = response.data.items[0].statistics;
      updatedStats = {
        followers: Number(stats.subscriberCount) || 0,
        postsCount: Number(stats.videoCount) || 0,
        reach: Number(stats.viewCount) || 0,
      };
    } else if (platform === "Twitter") {
      const twitterClient = new TwitterApi(account.accessToken);
      const { data: user } = await twitterClient.v2.me({
        "user.fields": ["public_metrics"],
      });

      updatedStats = {
        followers: user.public_metrics.followers_count || 0,
        postsCount: user.public_metrics.tweet_count || 0,
        reach: user.public_metrics.followers_count || 0,
      };
    } else if (platform === "LinkedIn") {
      // Identity refresh (stats usually remain 0 without Community Management API)
      const profileResponse = await axios.get(
        "https://api.linkedin.com/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${account.accessToken}` },
        },
      );

      // Update basic info and keep existing stats or fetch if permitted
      updatedStats = {
        followers: account.stats.followers || 0,
        postsCount: account.stats.postsCount || 0,
        reach: account.stats.reach || 0,
      };
      // If you have the Member Follower API access, add that axios call here
    }

    // 4. Update the database entry
    const platformIdx = seller.connectedPlatforms.findIndex(
      (p) => p.platform === platform,
    );
    seller.connectedPlatforms[platformIdx].stats = {
      ...seller.connectedPlatforms[platformIdx].stats,
      ...updatedStats,
    };
    seller.connectedPlatforms[platformIdx].lastSynced = new Date();

    // 5. Recalculate total global followers
    seller.totalFollowers = seller.connectedPlatforms.reduce(
      (acc, curr) => acc + (Number(curr.stats.followers) || 0),
      0,
    );

    // Save changes
    seller.markModified("connectedPlatforms");
    await seller.save();

    res.json({
      success: true,
      message: `${platform} statistics refreshed successfully!`,
      stats: updatedStats,
    });
  } catch (error) {
    console.error(`Sync Error for ${req.body.platform}:`, error);
    // If token is invalid, 401/403 errors will hit here
    res.status(500).json({
      success: false,
      message:
        "Session expired or API limit reached. Please reconnect your account.",
    });
  }
};

export const addCampaignPackage = async (req, res) => {
  try {
    const { platform, newPackage } = req.body;
    const sellerId = req.sellerId;

    const seller = await Seller.findById(sellerId).select("connectedPlatforms");
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    const platformData = seller.connectedPlatforms.find(
      (p) => p.platform.toLowerCase() === platform.toLowerCase(),
    );

    if (!platformData) {
      return res
        .status(400)
        .json({ success: false, message: `Connect ${platform} first.` });
    }

    let campaign = await Campaign.findOne({
      sellerId,
      platform: platform.toLowerCase(),
    });

    if (!campaign) {
      campaign = new Campaign({
        sellerId,
        platform: platform.toLowerCase(),
        username: platformData.username,
        followers: platformData.stats.followers,
        engagementRate: platformData.engagementRate || 0, // Save Engagement
        profilePicture: platformData.profilePicture,
        packages: [newPackage],
      });
    } else {
      // Sync latest stats
      campaign.username = platformData.username;
      campaign.followers = platformData.stats.followers;
      campaign.engagementRate = platformData.engagementRate || 0;
      campaign.profilePicture = platformData.profilePicture;
      campaign.packages.push(newPackage);
    }

    await campaign.save();
    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCampaignPackage = async (req, res) => {
  try {
    const { campaignId, packageId } = req.params;
    const updates = req.body; // Contains name, amount, etc.

    // Use $set to update specific fields within the array
    const query = { _id: campaignId, "packages._id": packageId };
    const updateFields = {};

    for (const key in updates) {
      updateFields[`packages.$.${key}`] = updates[key];
    }

    const campaign = await Campaign.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true },
    );

    if (!campaign)
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCampaignPackage = async (req, res) => {
  try {
    const { campaignId, packageId } = req.params;
    const campaign = await Campaign.findOneAndUpdate(
      { _id: campaignId, sellerId: req.sellerId },
      { $pull: { packages: { _id: packageId } } },
      { new: true },
    );
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ sellerId: req.sellerId }).populate(
      "sellerId",
      "fullName",
    );
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const sellerId = req.sellerId; // Assumes your sellerAuth middleware sets this

    // 1. Find orders where this user is the seller
    const orders = await Order.find({ sellerId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("clientId", "name email"); // Populate client details for the dashboard cards

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Seller Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getSellerOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const sellerId = req.sellerId;

    // 1. Find Order & Verify Ownership
    const order = await Order.findOne({ _id: orderId, sellerId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Find Linked Payment
    const payment = await Payment.findOne({ orderId: order._id });

    res.json({ success: true, order, payment });
  } catch (error) {
    console.error("Get Seller Order Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const acceptOrderRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const sellerId = req.sellerId;

    const order = await Order.findOne({ _id: orderId, sellerId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "requested") {
      return res
        .status(400)
        .json({ message: "Order cannot be accepted in its current state" });
    }

    // Update Status: requested -> payment_pending
    // Now the client will see the "Pay Now" button
    order.status = "payment_pending";
    await order.save();

    res.json({
      success: true,
      message: "Order Accepted. Waiting for client payment.",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectOrderRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const sellerId = req.sellerId;

    const order = await Order.findOne({ _id: orderId, sellerId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "requested") {
      return res
        .status(400)
        .json({ message: "Order cannot be rejected in its current state" });
    }

    order.status = "rejected";
    await order.save();

    res.json({ success: true, message: "Order Rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    // 1. Fetch all orders and payments
    const orders = await Order.find({ sellerId });
    const payments = await Payment.find().populate({
      path: "orderId",
      match: { sellerId: sellerId },
    });

    const sellerPayments = payments.filter((p) => p.orderId !== null);

    // 2. Calculate Stats
    const stats = {
      totalEarnings: sellerPayments.reduce(
        (acc, curr) => acc + curr.amountReleased,
        0,
      ),
      pendingEscrow: sellerPayments.reduce(
        (acc, curr) => acc + (curr.sellerPayable - curr.amountReleased),
        0,
      ),
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === "completed").length,
      activeOrders: orders.filter((o) => o.status === "active").length,
      requestedOrders: orders.filter((o) => o.status === "requested").length,
      platformDistribution: {
        instagram: orders.filter((o) => o.platform === "instagram").length,
        youtube: orders.filter((o) => o.platform === "youtube").length,
        other: orders.filter(
          (o) => !["instagram", "youtube"].includes(o.platform),
        ).length,
      },
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import WithdrawalRequest from "../models/adminModels/WithdrawalRequest.js";

// @desc    Get Earnings & Balance (With 48h Lock Logic)
// @route   GET /api/seller/earnings
export const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // 1. Fetch all Payments related to this Seller
    const earnings = await Payment.find()
      .populate({
        path: "orderId",
        match: { sellerId: sellerId },
        select:
          "orderDetails sellerName platform serviceType totalAmount createdAt",
      })
      .sort({ updatedAt: -1 });

    const sellerPayments = earnings.filter((p) => p.orderId !== null);

    // 2. Fetch Pending Withdrawals (Money requested but not yet sent)
    const pendingWithdrawals = await WithdrawalRequest.find({
      sellerId,
      status: "pending",
    });
    const totalPendingWithdrawalAmount = pendingWithdrawals.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    // 3. Fetch Completed Withdrawals (Money already sent to bank)
    const completedWithdrawals = await WithdrawalRequest.find({
      sellerId,
      status: "approved",
    });
    const totalWithdrawnAmount = completedWithdrawals.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    // 4. Calculate Balances
    let totalLifetimeEarnings = 0; // Total earned ever (Released Milestones)
    let withdrawableBalance = 0; // Available to withdraw now
    let lockedBalance = 0; // Released but < 48h old

    sellerPayments.forEach((payment) => {
      payment.milestones.forEach((ms) => {
        if (ms.status === "released" && ms.releasedAt) {
          const amount = ms.amount; // Use the raw milestone amount (assuming platform fee is handled globally or per milestone)

          totalLifetimeEarnings += amount;

          // Check 48-hour lock
          const releasedAt = new Date(ms.releasedAt);
          if (releasedAt < fortyEightHoursAgo) {
            withdrawableBalance += amount;
          } else {
            lockedBalance += amount;
          }
        }
      });
    });

    // 5. Final Net Available Balance calculation
    // Available = (Total Older than 48h) - (Already Withdrawn) - (Currently Requested)
    const netAvailableToWithdraw =
      withdrawableBalance - totalWithdrawnAmount - totalPendingWithdrawalAmount;

    // Safety check: ensure no negative balance (though logic shouldn't allow it)
    const finalAvailable = Math.max(0, netAvailableToWithdraw);

    res.json({
      success: true,
      earnings: sellerPayments,
      stats: {
        totalLifetimeEarnings,
        withdrawn: totalWithdrawnAmount,
        pendingRequest: totalPendingWithdrawalAmount,
        lockedIn48h: lockedBalance,
        availableToWithdraw: finalAvailable,
      },
    });
  } catch (error) {
    console.error("Earnings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request Payout to Bank
// @route   POST /api/seller/withdraw
export const requestWithdrawal = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const { amount } = req.body;

    // 1. Basic Validation
    if (!amount || amount < 500) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal amount is ₹500.",
      });
    }

    // 2. Check Seller Bank Details (Using +select to get hidden fields)
    const seller = await Seller.findById(sellerId).select(
      "+payoutDetails.accountNumber +payoutDetails.ifscCode +payoutDetails.bankName +payoutDetails.upiId",
    );

    if (
      !seller ||
      !seller.payoutDetails ||
      !seller.payoutDetails.accountNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your Bank Account details in Profile settings first.",
      });
    }

    // 3. Recalculate Available Balance (Security Check)
    // (Reuse the logic from getSellerEarnings to ensure server-side validation)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const earnings = await Payment.find().populate({
      path: "orderId",
      match: { sellerId: sellerId },
    });
    const sellerPayments = earnings.filter((p) => p.orderId !== null);

    const pendingWithdrawals = await WithdrawalRequest.find({
      sellerId,
      status: "pending",
    });
    const completedWithdrawals = await WithdrawalRequest.find({
      sellerId,
      status: "approved",
    });

    const totalPending = pendingWithdrawals.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    const totalWithdrawn = completedWithdrawals.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    let totalMatureEarnings = 0;
    sellerPayments.forEach((payment) => {
      payment.milestones.forEach((ms) => {
        if (
          ms.status === "released" &&
          new Date(ms.releasedAt) < fortyEightHoursAgo
        ) {
          totalMatureEarnings += ms.amount;
        }
      });
    });

    const availableBalance =
      totalMatureEarnings - totalWithdrawn - totalPending;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Available withdrawable balance: ₹${availableBalance}`,
      });
    }

    // 4. Create Withdrawal Request
    const withdrawal = await WithdrawalRequest.create({
      sellerId,
      amount,
      payoutDetails: {
        accountNumber: seller.payoutDetails.accountNumber,
        ifscCode: seller.payoutDetails.ifscCode,
        bankName: seller.payoutDetails.bankName,
        upiId: seller.payoutDetails.upiId,
      },
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted successfully. Processing in 24-48 hours.",
      withdrawal,
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
