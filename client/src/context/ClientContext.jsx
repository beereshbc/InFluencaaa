import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ClientContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

export const ClientProvider = ({ children }) => {
  const navigate = useNavigate();
  const [clientToken, setClientToken] = useState(
    localStorage.getItem("clientToken") || "",
  );

  const [clientData, setClientData] = useState(null);

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const getClientData = async () => {
    try {
      const { data } = await axios.get("/api/client/get-profile", {
        headers: { Authorization: `Bearer ${clientToken}` },
      });

      if (data.success) {
        setClientData(data.clientData);
      } else {
        if (
          data.message === "jwt expired" ||
          data.message.includes("authorized")
        ) {
          setClientToken("");
          localStorage.removeItem("clientToken");
        }
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error.message);
    }
  };

  const getAllSellers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/client/all-sellers", {
        headers: { Authorization: `Bearer ${clientToken}` },
      });

      if (data.success) {
        setSellers(data.sellers);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load marketplace");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (clientToken) {
      getClientData();
      // getAllSellers();
    } else {
      setClientData(null);
      setSellers([]);
    }
  }, [clientToken]);

  const value = {
    navigate,
    axios,
    clientToken,
    setClientToken,
    clientData,

    sellers,
    getAllSellers,
    loading,
    error,
  };

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
};

export const useClientContext = () => {
  return useContext(ClientContext);
};
