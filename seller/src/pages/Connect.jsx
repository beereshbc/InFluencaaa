import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Linkedin,
  RefreshCw,
  Plus,
  Check,
  Globe2,
  Link2,
} from "lucide-react";
import { useSellerContext } from "../context/SellerContext";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const Connect = () => {
  const { sellerData, axios, sellerToken, getSellerProfile } =
    useSellerContext();
  const [isSyncing, setIsSyncing] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success("Account connected successfully!");
      getSellerProfile();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (error) {
      toast.error("Connection failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, getSellerProfile]);

  const handleYouTubeConnect = async () => {
    try {
      const { data } = await axios.get("/api/seller/auth/youtube/init", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      if (data.success) window.location.href = data.url;
    } catch (error) {
      toast.error("Could not initialize YouTube connection");
    }
  };

  const handleTwitterConnect = async () => {
    try {
      const { data } = await axios.get("/api/seller/auth/twitter/init", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      if (data.success) window.location.href = data.url;
    } catch (error) {
      toast.error("Could not initialize Twitter connection");
    }
  };
  const handleLinkedinConnect = async () => {
    try {
      const { data } = await axios.get("/api/seller/auth/linkedin/init", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });
      if (data.success) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error("Could not initialize LinkedIn connection");
    }
  };

  const handleSync = async (platformName) => {
    setIsSyncing(platformName);
    try {
      const { data } = await axios.post(
        "/api/seller/sync-platform",
        { platform: platformName },
        { headers: { Authorization: `Bearer ${sellerToken}` } },
      );

      if (data.success) {
        await getSellerProfile();
        toast.success(`${platformName} statistics updated`);
      } else {
        toast.error(data.message || "Failed to sync platform");
      }
    } catch (error) {
      toast.error("Sync failed. You might need to reconnect.");
    } finally {
      setIsSyncing(null);
    }
  };
  const getStatLabel = (platform, type) => {
    const labels = {
      YouTube: { main: "Subscribers", activity: "Videos" },
      Twitter: { main: "Followers", activity: "Tweets" },
      LinkedIn: { main: "Connections", activity: "Activity" }, // Professional labels
      default: { main: "Followers", activity: "Posts" },
    };
    return (labels[platform] || labels.default)[type];
  };
  const platforms = [
    {
      id: "yt",
      name: "YouTube",
      icon: Youtube,
      brand: "text-[#FF0000]",
      handler: handleYouTubeConnect,
    },
    {
      id: "tw",
      name: "Twitter",
      icon: Twitter,
      brand: "text-[#1DA1F2]",
      handler: handleTwitterConnect,
    },
    { id: "ig", name: "Instagram", icon: Instagram, brand: "text-[#E4405F]" },
    {
      id: "li",
      name: "LinkedIn",
      icon: Linkedin,
      brand: "text-[#0A66C2]",
      handler: handleLinkedinConnect,
    },
    { id: "fb", name: "Facebook", icon: Facebook, brand: "text-[#1877F2]" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-28 px-4 md:px-8 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Link2 className="text-primary" size={32} /> Connected Apps
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Verified reach across your professional networks.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Globe2 size={16} className="text-primary" />
            <span className="text-xs font-bold text-gray-700">
              {sellerData?.connectedPlatforms?.length || 0}/5 Linked
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {platforms.map((p, index) => {
            const connected = sellerData?.connectedPlatforms?.find(
              (c) => c.platform === p.name,
            );

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={p.id}
                className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-primary/5">
                    <p.icon
                      className={connected ? p.brand : "text-gray-300"}
                      size={28}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {p.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-400">
                      {connected ? `@${connected.username}` : "Not connected"}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <AnimatePresence>
                    {connected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-3 gap-4 border-l border-gray-100 pl-6"
                      >
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            {getStatLabel(p.name, "main")}
                          </p>
                          <p className="text-sm font-black text-gray-700">
                            {connected.stats.followers >= 1000
                              ? `${(connected.stats.followers / 1000).toFixed(1)}k`
                              : connected.stats.followers}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            {getStatLabel(p.name, "activity")}
                          </p>
                          <p className="text-sm font-black text-gray-700">
                            {connected.stats.postsCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Reach
                          </p>
                          <p className="text-sm font-black text-gray-700">
                            {connected.stats.reach >= 1000
                              ? `${(connected.stats.reach / 1000).toFixed(1)}k`
                              : connected.stats.reach}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-3">
                  {connected ? (
                    <>
                      <button
                        onClick={() => handleSync(p.name)}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <RefreshCw
                          size={18}
                          className={isSyncing === p.name ? "animate-spin" : ""}
                        />
                      </button>
                      <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center border border-green-100">
                        <Check size={20} strokeWidth={3} />
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={p.handler}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Connect;
