import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcrypt.js";
import { generateToken } from "../lib/utils.js";
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, profilePic = "" } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Enter Full Details" });
    }
    const existingUser = User.findOne({ email });
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
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    }
    // else{
    //     return res.status(400).json({ message: "Invalid User Data" });
    // }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = (req, res) => {};
export const logout = (req, res) => {};
