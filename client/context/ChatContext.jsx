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
        setUsers(data.users);
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
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    }
  };

  /* ======================
     SEND MESSAGE (FIXED)
  ====================== */
  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Message failed");
    }
  };

  /* ======================
     SOCKET SUBSCRIBE
  ====================== */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMessage) => {
      if (selectedUser && incomingMessage.senderId === selectedUser._id) {
        const seenMessage = { ...incomingMessage, seen: true };

        setMessages((prev) => [...prev, seenMessage]);
        axios.put(`/api/messages/mark/${incomingMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [incomingMessage.senderId]:
            (prev[incomingMessage.senderId] || 0) + 1,
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

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
