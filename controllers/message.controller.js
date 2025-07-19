import { getReceiverSocketId, io } from "../socket/socket.js";
import Conversation from "./../models/conversation.model.js";
import Message from "./../models/message.model.js";
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;

    const { receiverId } = req.params;

    const { message } = req.body;
    let conversation = await Conversation.findOne({
      $all: [senderId, receiverId],
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    await conversation.messages.push(newMessage._id);

    await conversation.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log("Error in sendMessage function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.user._id;

    const { receiverId } = req.params;

    let conversation = await Conversation.findOne({
      $all: [senderId, receiverId],
    });

    if (!conversation) {
      return res.status(404).json({
        error: "No conversation find",
        messages: [],
      });
    }

    if (conversation?.messages.length > 0) {
      await conversation.populate({
        path: "messages",
        select: "message createdAt",
      });
    }
    res.status(200).json({
      success: true,
      messages: conversation?.messages || [],
    });
  } catch (error) {
    console.log("Error in getMessage function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
