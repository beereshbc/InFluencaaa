import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import sellerRouter from "./routers/sellerRouter.js";
import clientRouter from "./routers/clientRouter.js";
import connectDB from "./config/mongoDB.js";
import connectCloudinary from "./config/cloudinary.js";
import Order from "./models/adminModels/Order.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Connect Services
await connectDB();
await connectCloudinary();

const allowedOrigins = [
  "https://influencaasellerin.vercel.app",
  "https://influencaaabrandin.vercel.app",
];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket Events
io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // User joins a room unique to the Order ID
  socket.on("join_chat", ({ orderId, userId }) => {
    if (orderId) {
      socket.join(orderId);
      console.log(`User ${userId} joined room: ${orderId}`);
    }
  });

  // Handle incoming messages
  socket.on("send_message", async (messageData) => {
    const { orderId, senderId, senderModel, text } = messageData;

    if (!orderId || !text) return;

    try {
      const newMessage = {
        senderId,
        senderModel, // "client" or "Seller"
        text,
        timestamp: new Date(),
      };

      // 1. Persist to Database
      await Order.findByIdAndUpdate(orderId, {
        $push: { chatHistory: newMessage },
      });

      // 2. Broadcast to everyone in the Order Room
      io.to(orderId).emit("receive_message", newMessage);
    } catch (error) {
      console.error("Chat Persistence Error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Escrow API with Socket.io is running");
});

app.use("/api/seller", sellerRouter);
app.use("/api/client", clientRouter);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
