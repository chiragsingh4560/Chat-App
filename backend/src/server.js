import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
const app = express();
dotenv.config();
import { connectDB } from "./lib/db.js";
console.log(process.env.MONGODB_URI);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
  // connectDB();
});
