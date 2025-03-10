// import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, profilePic = "" } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Enter Full Details" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: `Signup Error: ${error.message}` });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Enter both email and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User doesnt exist pls signup for this email" });
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res
        .status(400)
        .json({ message: "Email or password is incorrect" });
    }

    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: `Login Error: ${error.message}` });
  }
};
export const logout = async (req, res) => {
  try {
    // user token wala cookie ka token hi empty krdiya and maxAge=0 so expire immediately..clear cookie se better h
    res.cookie("user_token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: `Logout Error: ${error.message}` });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic is Required" });
    }
    const userId = req.user._id; //ye authMiddle ware i.e protectRoute krdega!
    // now upload pic to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    // after uploaded to cloudinary update profile pic url in DB
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true } //returns updated object
    );
    res.status(200).json(updateUser);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

// ye kch kr nhi rha h bs check kr rha h if user is authenticated . how? auth middleware se check in auth.route.js usme protectRoute h iss controller k phle!
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: `Error in checkAuth controller: ${error.message}` });
  }
};
