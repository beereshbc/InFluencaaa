import mongoose from "mongoose";

// Individual Package (Service) Schema
const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    serviceType: { type: String, required: true }, // e.g., "Reel", "Video"
    amount: { type: Number, required: true },
    description: { type: String },
    deliverables: [{ type: String }],
    timeline: { type: String, default: "3 Days" },
    revisions: { type: Number, default: 1 },
    requirements: [{ type: String }],
    published: { type: Boolean, default: true }, // Toggle for Draft/Live
  },
  { timestamps: true },
);

const campaignSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "youtube", "linkedin", "twitter", "facebook"],
      required: true,
    },
    // Mirroring platform data for quick UI access
    username: { type: String },
    followers: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    profilePicture: { type: String },
    packages: [packageSchema],
  },
  { timestamps: true },
);

// Indexing for faster retrieval by seller and platform
campaignSchema.index({ sellerId: 1, platform: 1 }, { unique: true });

export default mongoose.models.Campaign ||
  mongoose.model("Campaign", campaignSchema);
