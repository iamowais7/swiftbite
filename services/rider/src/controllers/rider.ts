import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/tryCatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.role !== "rider") {
    return res.status(403).json({ message: "Only riders can create a rider profile" });
  }
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "Rider image is required" });
  }
  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) {
    return res.status(500).json({ message: "Failed to generate image buffer" });
  }
  const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
    buffer: fileBuffer.content,
  });
  const { phoneNumber, aadhaarNumber, drivingLicenseNumber, latitude, longitude } = req.body;
  if (!phoneNumber || !aadhaarNumber || !drivingLicenseNumber || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existingProfile = await Rider.findOne({ userId: user._id });
  if (existingProfile) {
    return res.status(400).json({ message: "Rider profile already exists." });
  }
  const riderProfile = await Rider.create({
    userId: user._id,
    picture: uploadResult.url,
    phoneNumber,
    aadhaarNumber,
    drivingLicenseNumber,
    location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
    isAvailable: false,
    isVerified: false,
  });
  return res.status(201).json({ message: "Rider profile created successfully", riderProfile });
});

export const fetchMyProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const account = await Rider.findOne({ userId: user._id });
  res.json(account);
});

export const toggleRiderAvailablity = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.role !== "rider") {
    return res.status(403).json({ message: "Only riders can toggle availability" });
  }
  // frontend sends isAvailable (fixed from isAvailble)
  const isAvailable: boolean = req.body.isAvailable ?? req.body.isAvailble;
  const { latitude, longitude } = req.body;

  if (typeof isAvailable !== "boolean") {
    return res.status(400).json({ message: "isAvailable must be boolean" });
  }
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: "Location is required" });
  }
  const rider = await Rider.findOne({ userId: user._id });
  if (!rider) {
    return res.status(404).json({ message: "Rider profile not found" });
  }
  if (isAvailable && !rider.isVerified) {
    return res.status(403).json({ message: "Rider is not verified yet" });
  }
  rider.isAvailable = isAvailable;
  rider.location = { type: "Point", coordinates: [Number(longitude), Number(latitude)] };
  rider.lastActiveAt = new Date();
  await rider.save();
  res.json({
    message: isAvailable ? "Rider is now online" : "Rider is now offline",
    rider,
  });
});

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;
  if (!riderUserId) {
    return res.status(401).json({ message: "Please Login" });
  }
  // fixed: isAvailble → isAvailable
  const rider = await Rider.findOne({ userId: riderUserId, isAvailable: true });
  if (!rider) {
    return res.status(404).json({ message: "Rider not found or not available" });
  }
  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderUserId: rider.userId,
        riderName: rider.phoneNumber, // use phoneNumber as identifier since no name field
        riderPhone: rider.phoneNumber,
      },
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );
    if (data.success) {
      // fixed: usedId → userId
      await Rider.findOneAndUpdate(
        { userId: riderUserId, isVerified: true },
        { isAvailable: false },
        { new: true }
      );
      res.json({ message: "Order accepted" });
    }
  } catch (error) {
    res.status(400).json({ message: "Order already taken" });
  }
});

export const fetchMyCurrentOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  if (!riderUserId) {
    return res.status(401).json({ message: "Please Login" });
  }
  const rider = await Rider.findOne({ userId: riderUserId, isVerified: true });
  if (!rider) {
    return res.status(404).json({ message: "Rider not found" });
  }
  try {
    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id}`,
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );
    res.json({ order: data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export const updateOrderStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ message: "Please Login" });
  }
  const rider = await Rider.findOne({ userId });
  if (!rider) {
    return res.status(404).json({ message: "Rider not found" });
  }
  const { orderId } = req.params;
  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,
      { orderId },
      { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );
    res.json({ message: data.message });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
