import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    thumbnail: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    niche: {
      type: String,
      enum: [
        "Fashion & Lifestyle",
        "Tech & Gaming",
        "Food & Beverage",
        "Travel",
        "Fitness & Health",
        "Beauty & Makeup",
        "Education",
        "Entertainment",
        "Finance",
        "Other",
        "General",
      ],
      default: "General",
    },
    bio: { type: String, default: "Influencer at BlueCarbon" },
    location: { type: String, default: "India" },
    phone: { type: String, default: "" },
    languages: [{ type: String }],
    audience: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    responseTime: { type: String, default: "1 hour" },
    deliveryTime: { type: String, default: "3 days" },
    isBlocked: { type: Boolean, default: false },

    connectedPlatforms: [
      {
        platform: {
          type: String,
          required: true,
          enum: ["Instagram", "YouTube", "Twitter", "LinkedIn", "Facebook"],
        },
        username: { type: String, required: true },
        platformId: { type: String },
        isVerified: { type: Boolean, default: false },
        profilePicture: { type: String },
        stats: {
          followers: { type: Number, default: 0 },
          following: { type: Number, default: 0 },
          postsCount: { type: Number, default: 0 },
          engagementRate: { type: Number, default: 0 },
          reach: { type: Number, default: 0 },
          impressions: { type: Number, default: 0 },
          avgLikes: { type: Number, default: 0 },
          avgComments: { type: Number, default: 0 },
        },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false },
        tokenExpiry: { type: Date, select: false },
        lastSynced: { type: Date, default: Date.now },
      },
    ],

    twitterOAuth: {
      codeVerifier: { type: String },
      state: { type: String },
    },
    linkedinOAuth: {
      state: { type: String },
    },

    totalFollowers: { type: Number, default: 0 },
    avgEngagementRate: { type: Number, default: 0 },
    portfolio: [{ type: String }],

    payoutDetails: {
      accountHolderName: { type: String, select: false, trim: true },
      bankName: { type: String, select: false, trim: true },
      accountNumber: { type: String, select: false, trim: true },
      ifscCode: { type: String, select: false, trim: true, uppercase: true },
      upiId: { type: String, select: false, trim: true },
      isVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Seller", sellerSchema);
