import { createContext, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

const SellerContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

axios.defaults.withCredentials = true;

export const SellerProvider = ({ children }) => {
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState(null);
  const [sellerToken, setSellerToken] = useState(
    localStorage.getItem("sellerToken")
      ? localStorage.getItem("sellerToken")
      : "",
  );

  const getSellerProfile = async () => {
    try {
      const { data } = await axios.get("/api/seller/profile", {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });

      if (data.success) setSellerData(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (sellerToken) getSellerProfile();
  }, []);

  const value = {
    navigate,
    sellerToken,
    setSellerToken,
    axios,
    sellerData,
    getSellerProfile,
  };

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
};

export const useSellerContext = () => {
  return useContext(SellerContext);
};
