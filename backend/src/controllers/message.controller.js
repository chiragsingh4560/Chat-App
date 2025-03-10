import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  // here we will get all users except the current logged user
  try {
    const loggedInUserId = req.user._id; //ye protect Route krdega
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password"); //similar to filter..sirf loggedIn user ko nhi include krna h ..this db query is faster than filter method qki ye directly db m hi filter krega !
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in get users for side bar: ", error.message);
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};
// isme kya hoga ki saare msgs between currently loggedIn user and dusre user jiska id 'params' m aagya by clicking on the user ..params m aagya /:id aisa
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; //extract the id from from params and rename it to userToChatId
    const myId = req.user._id; //ye current logged in wala ..authMiddleware se aajayagea
    // get all messages between myId and userToChatId!  using or operation of DB
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getting messages: ", error.message);
    return res
      .status(500)
      .json({ message: `Error in getting messages: ${error.message}` });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params; //extract the id from from params and rename it to receiverId
    const senderId = req.user._id; //ye current logged in wala ..authMiddleware se aajayagea
    const { text, image } = req.body; //ye messages hai jo ki senderId wala user bhej rha h to receiverId
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    // todo: realtime functionality goes here!=> socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sending messages: ", error.message);
    return res
      .status(500)
      .json({ message: `Error in sending messages: ${error.message}` });
  }
};
