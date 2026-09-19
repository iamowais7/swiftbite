import express from "express"
import connectDB from "./config/db.js";
import dotenv from "dotenv"
import restaurantRoutes from "./routes/restaraunt.js"
import itemRoutes from "./routes/menuitem.js"
import cartRoutes from "./routes/cart.js"
import addressRoutes from "./routes/address.js"
import orderRoutes from "./routes/order.js"
import aiRoutes from "./routes/ai.js"
import cors from "cors"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";
dotenv.config()

await connectRabbitMQ();
startPaymentConsumer();
const app = express();

const PORT = process.env.PORT || 7011;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/restaurant",restaurantRoutes)
app.use("/api/item",itemRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/address",addressRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/ai",aiRoutes)
app.listen(PORT,()=>{
  console.log(`Restaurant service is running on ${PORT}`)
  connectDB();
})