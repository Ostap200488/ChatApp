import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ✅ Check auth on refresh
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);

        // 🔥 REDIRECT AFTER REFRESH
        navigate("/");
      }
    } catch {
      console.log("Auth check failed");
    }
  };

  // ✅ LOGIN / SIGNUP
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);

        axios.defaults.headers.common["Authorization"] =
          `Bearer ${data.token}`;

        setToken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(data.message);

        // 🔥 THIS WAS MISSING
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    delete axios.defaults.headers.common["Authorization"];

    toast.success("Logged out successfully");

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    navigate("/login");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.on("getOnlineUsers", setOnlineUsers);
    setSocket(newSocket);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
      checkAuth();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
