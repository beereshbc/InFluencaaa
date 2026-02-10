import clientModel from "../models/ClientModels/clientModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Seller from "../models/SellerModels/Seller.js";
import Campaign from "../models/SellerModels/Campaign.js";
import Payment from "../models/adminModels/Payment.js";
import OrderResolution from "../models/adminModels/OrderResolution.js";
import Order from "../models/adminModels/Order.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerClient = async (req, res) => {
  try {
    const { name, email, brandName, password } = req.body;

    if (!name || !email || !brandName || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const exists = await clientModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Client already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newClient = new clientModel({
      name,
      email,
      brandName,
      password: hashedPassword,
    });

    const client = await newClient.save();
    const token = createToken(client._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await clientModel.findOne({ email });

    if (!client) {
      return res.json({ success: false, message: "Client doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, client.password);

    if (isMatch) {
      const token = createToken(client._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getClientProfile = async (req, res) => {
  try {
    const id = req.clientId;

    const clientData = await clientModel.findById(id).select("-password");

    if (!clientData) {
      return res.json({ success: false, message: "Client not found" });
    }

    res.json({ success: true, clientData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// @desc    Get All Active Sellers
// @route   GET /api/client/all-sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ isBlocked: false })
      .select(
        "fullName thumbnail niche rating totalReviews location connectedPlatforms bio portfolio",
      )
      .lean();

    const campaigns = await Campaign.find({}).lean();

    const combinedData = sellers.map((seller) => {
      const sellerCampaigns = campaigns.filter(
        (c) => c.sellerId.toString() === seller._id.toString(),
      );

      const activeCampaigns = sellerCampaigns.filter(
        (c) => c.packages && c.packages.some((p) => p.published),
      );

      return {
        ...seller,
        campaigns: activeCampaigns,
      };
    });

    const activeSellers = combinedData.filter((s) => s.campaigns.length > 0);

    res.json({ success: true, sellers: activeSellers });
  } catch (error) {
    console.error("Marketplace Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load marketplace" });
  }
};

// @desc    Get Single Seller Public Profile
// @route   GET /api/client/seller/:id
export const getSellerPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // --- FIX IS HERE ---
    // Removed "-payoutDetails" from the select string.
    // The sub-fields (accountNumber, etc.) are already hidden by the Schema.
    const seller = await Seller.findById(id)
      .select("-password -email -phone -twitterOAuth -linkedinOAuth -__v")
      .lean();

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // 2. Fetch Seller's Campaigns
    const campaigns = await Campaign.find({ sellerId: id }).lean();

    // 3. Filter only published packages
    const validCampaigns = campaigns
      .map((camp) => ({
        ...camp,
        packages: camp.packages.filter((p) => p.published),
      }))
      .filter((camp) => camp.packages.length > 0);

    // 4. Combine
    const fullProfile = {
      ...seller,
      campaigns: validCampaigns,
    };

    res.json({ success: true, seller: fullProfile });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Seller Reviews
// @route   GET /api/client/seller/:id/reviews
export const getSellerReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await OrderResolution.find({
      sellerId: id,
      type: "review",
    })
      .populate("clientId", "name thumbnail")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Review Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create Order Request
// @route   POST /api/client/order/create
export const createOrderRequest = async (req, res) => {
  try {
    const {
      sellerId,
      sellerName,
      platform,
      serviceType,
      serviceDetails,
      orderDetails,
      totalAmount,
    } = req.body;

    const clientId = req.clientId;

    if (!sellerId || !totalAmount || !orderDetails.brandName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const sellerExists = await Seller.findById(sellerId);
    if (!sellerExists) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const newOrder = new Order({
      sellerId,
      clientId,
      sellerName,
      platform,
      serviceType,
      serviceDetails: {
        amount: serviceDetails.amount,
        timeline: serviceDetails.timeline,
        revisions: serviceDetails.revisions,
        deliverables: serviceDetails.deliverables || [],
      },
      orderDetails: {
        brandName: orderDetails.brandName,
        contactPerson: orderDetails.contactPerson,
        email: orderDetails.email,
        phone: orderDetails.phone,
        campaignBrief: orderDetails.campaignBrief,
        budget: orderDetails.budget,
        timeline: orderDetails.timeline,
        specialRequirements: orderDetails.specialRequirements || "",
        targetAudience: orderDetails.targetAudience || "",
        campaignGoals: orderDetails.campaignGoals || "",
        contentGuidelines: orderDetails.contentGuidelines || "",
      },
      totalAmount,
      status: "requested",
      chatHistory: [],
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Request sent to creator! View in Dashboard.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Client Orders
// @route   GET /api/client/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.clientId })
      .select("-chatHistory")
      .sort({ createdAt: -1 })
      .populate("sellerId", "fullName thumbnail niche");

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Single Order Details
// @route   GET /api/client/order/:id
export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const clientId = req.clientId;

    const order = await Order.findOne({ _id: orderId, clientId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const payment = await Payment.findOne({ orderId: order._id });

    res.json({ success: true, order, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Submit Review / Report / Refund
// @route   POST /api/client/order/resolution
export const submitOrderResolution = async (req, res) => {
  try {
    const { orderId, sellerId, type, rating, reasonCategory, description } =
      req.body;
    const clientId = req.clientId;

    const resolution = await OrderResolution.create({
      orderId,
      clientId,
      sellerId,
      type,
      rating: type === "review" ? rating : undefined,
      reasonCategory,
      description,
    });

    if (type === "review") {
      await Order.findByIdAndUpdate(orderId, { status: "completed" });
      const reviews = await OrderResolution.find({ sellerId, type: "review" });

      let avgRating = 0;
      if (reviews.length > 0) {
        const totalStars = reviews.reduce((acc, item) => acc + item.rating, 0);
        avgRating = totalStars / reviews.length;
      }

      await Seller.findByIdAndUpdate(sellerId, {
        rating: avgRating.toFixed(1),
        $inc: { totalReviews: 1 },
      });
    } else if (type === "refund_request") {
      await Order.findByIdAndUpdate(orderId, { status: "dispute_raised" });
    }

    res
      .status(201)
      .json({ success: true, message: "Submitted successfully", resolution });
  } catch (error) {
    console.error("Resolution Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { registerClient, loginClient, getClientProfile };
