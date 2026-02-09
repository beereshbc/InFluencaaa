import clientModel from "../models/ClientModels/clientModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Seller from "../models/SellerModels/Seller.js";
import Campaign from "../models/SellerModels/Campaign.js";
import Order from "../models/adminModels/Order.js";
import Payment from "../models/adminModels/Payment.js";

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
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ isBlocked: false })
      .select("-password -email -phone -twitterOAuth -linkedinOAuth")
      .lean();

    const campaigns = await Campaign.find({}).lean();

    const combinedData = sellers.map((seller) => {
      const sellerCampaigns = campaigns.filter(
        (c) => c.sellerId.toString() === seller._id.toString(),
      );

      return {
        ...seller,
        campaigns: sellerCampaigns,
      };
    });
    const activeSellers = combinedData.filter((s) => s.campaigns.length > 0);

    res.json({ success: true, sellers: activeSellers });
  } catch (error) {
    console.error("Marketplace Data Error:", error);
    res.json({ success: false, message: "Failed to load marketplace data" });
  }
};
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
      serviceDetails,
      orderDetails,
      totalAmount,
      status: "requested",
      paymentId: null,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order request sent successfully! Waiting for seller approval.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.clientId })
      .sort({ createdAt: -1 })
      .populate("sellerId", "fullName thumbnail niche");

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const clientId = req.clientId;

    // 1. Find Order and ensure it belongs to this client
    const order = await Order.findOne({ _id: orderId, clientId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Find Linked Payment (if exists)
    const payment = await Payment.findOne({ orderId: order._id });

    res.json({
      success: true,
      order,
      payment,
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export { registerClient, loginClient, getClientProfile, getAllSellers };
