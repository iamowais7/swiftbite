import express from "express"
import dotenv from "dotenv";
import cloudinary from "cloudinary"
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import paymentRoutes from "./routes/payment.js"

dotenv.config();
connectRabbitMQ();
const app = express();
app.use(cors());
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));
const cloudName = process.env.Cloud_Name;
const cloudApiKey = process.env.Cloud_Api_Key;
const cloudApiSecret = process.env.Cloud_Api_Secret;

if (!cloudName || !cloudApiKey || !cloudApiSecret) {
  throw new Error("Cloudinary env variables are missing");
}

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: cloudApiKey,
  api_secret: cloudApiSecret,
});

app.use("/api", uploadRoutes);
app.use("/api/payment", paymentRoutes)

const PORT = process.env.PORT || 7012;
app.listen(PORT,()=>{
  console.log(`utils service is running on PORT ${PORT}`);
})