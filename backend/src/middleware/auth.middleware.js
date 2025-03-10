import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
// user authenticate krega and req.user m user ko put krdega thats it auth middleware h

export const protectRoute = async (req, res, next) => {
  try {
    const userToken = req.cookies.user_token;
    if (!userToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized- No Token Provided" });
    }
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: `Internal Error: ${error.message}` });
  }
};
