import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ✅ AXIOS GLOBAL CONFIG
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // safe even if unused

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  /* ======================
     AUTH CHECK
  ====================== */
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (err) {
      console.log("Auth check failed");
      setAuthUser(null);
    }
  };

  /* ======================
     LOGIN / REGISTER
  ====================== */
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // ✅ SET HEADER IMMEDIATELY
      axios.defaults.headers.common.Authorization =
        `Bearer ${data.token}`;

      setAuthUser(data.userData);
      connectSocket(data.userData);

      toast.success(data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    delete axios.defaults.headers.common.Authorization;

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out successfully");
    navigate("/login");
  };

  /* ======================
     UPDATE PROFILE
  ====================== */
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

  /* ======================
     SOCKET
  ====================== */
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.on("getOnlineUsers", setOnlineUsers);
    setSocket(newSocket);
  };

  /* ======================
     INIT ON REFRESH
  ====================== */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization =
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
