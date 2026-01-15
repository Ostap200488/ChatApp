import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  /* ======================
     GET USERS (SIDEBAR)
  ====================== */
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  };

  /* ======================
     GET MESSAGES
  ====================== */
  const getMessages = async (userId) => {
    if (!userId) return;

    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    }
  };

  /* ======================
     SEND MESSAGE (FIXED)
  ====================== */
  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) return null;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      // ✅ backend might return newMessage OR message
      const newMsg = data?.newMessage || data?.message;

      if (!data?.success || !newMsg) {
        toast.error(data?.message || "Message failed");
        return null;
      }

      // ✅ show instantly for sender
      setMessages((prev) => [...prev, newMsg].filter(Boolean));

      return newMsg;
    } catch (error) {
      toast.error(error.response?.data?.message || "Message failed");
      throw error;
    }
  };

  /* ======================
     SOCKET SUBSCRIBE (FIXED)
  ====================== */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMessage) => {
      if (!incomingMessage) return;

      // ✅ normalize fields (senderId vs sender, receiverId vs receiver)
      const senderId = incomingMessage.senderId || incomingMessage.sender;
      const receiverId =
        incomingMessage.receiverId || incomingMessage.receiver;

      if (!senderId || !receiverId) return;

      // ✅ if message belongs to open chat, display it
      if (
        selectedUser &&
        (senderId === selectedUser._id || receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, incomingMessage].filter(Boolean));

        // mark as seen (don't crash if fails)
        axios
          .put(`/api/messages/mark/${incomingMessage._id}`)
          .catch(() => {});
      } else {
        // ✅ update unseen counts safely
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, axios]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    setSelectedUser,
    setMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
