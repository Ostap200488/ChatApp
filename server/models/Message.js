import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ TEXT MESSAGE (THIS WAS MISSING)
    text: {
      type: String,
      default: "",
    },

    // optional image message
    image: {
      type: String,
      default: "",
    },

    // ✅ FIX TYPO (seem → seen)
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
