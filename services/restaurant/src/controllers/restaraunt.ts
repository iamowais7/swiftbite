import axios from "axios";
import getBuffer from "../config/datauri.js";
import   { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/tryCatch.js";
import Restaurant from "../models/Restaurant.js";
import jwt , { Jwt } from "jsonwebtoken";
import { rankByRelevance } from "../config/groq.js";

export const addRestaurant = TryCatch(async(req:AuthenticatedRequest, res) => {
  const user = req.user;

  if(!user){
    return res.status(401).json({
      message:"Unauthorized",
    });
  }

  const existingRestaunrant = await Restaurant.findOne({
 ownerId:user._id,
  });
  if(existingRestaunrant){
    return res.status(400).json({
      message:"You already have a restaurant",
    });
  }

  const { name, description, latitude, longitude, formattedAddress, phone} = req.body;
  if(!name || !latitude || !longitude){
    return res.status(400).json({
      message:"Please give all details",
    });
  }
  const file = req.file;
  if(!file){
    return res.status(400).json({
      message:"Please give image",
    });
  }

  const fileBuffer = getBuffer(file)

  if(!fileBuffer?.content){
    return res.status(500).json({
      message:"Failed to create file buffer",
    })
  }
  const {data: uploadResult} = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
     buffer: fileBuffer.content,
  });
  const restaurant = await Restaurant.create({
    name,description,phone,image:uploadResult.url,ownerId:user._id,autoLocation:{
      type:"Point",
      coordinates:[Number(longitude),Number(latitude)],
      formattedAddress,
    },
    isVerified:false,
  });
  return res.status(201).json({
    message:'Restaurant created successfully',
    restaurant,
  })
})

export const fetchMyRestaurant = TryCatch(async(req:AuthenticatedRequest,res)=>{
  if(!req.user){
    return res.status(401).json({
      message:"Please Login",
    })
  }
  const restaurant = await Restaurant.findOne({ownerId:req.user._id});
  if(!restaurant){
    return res.status(400).json({
      message:"No Restaurant Found",
    });
  }
  if(!req.user.restaurantId){
    const token = jwt.sign({
      user:{
        ...req.user,
        restaurantId: restaurant._id,
      },
    },
    process.env.JWT_SEC as string,
    {
      expiresIn:"15d",
    }
  );
  return res.json({restaurant, token})
  }
  res.json({restaurant});
});

export const updateStatusRestaurant = TryCatch(async(req:AuthenticatedRequest,res)=>{
  if(!req.user){
    return res.status(403).json({message:"Please Login"})
  }
  const {status} = req.body;
  if(typeof status !== "boolean"){
    return res.status(400).json({
      message:"Status must be boolean",
    });
  }
  const restaraunt = await Restaurant.findOneAndUpdate(
    { ownerId: req.user._id },
    { isOpen: status },
    { new: true }
  );
  if (!restaraunt) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  res.json({ message: `Restaurant is now ${status ? "open" : "closed"}`, restaurant: restaraunt });
});

export const updateRestaurant = TryCatch(async(req:AuthenticatedRequest,res)=>{
  if(!req.user){
    return res.status(403).json({
      message:"Please Login",
    });
  }
  const {name, description} = req.body;
  const restaraunt = await Restaurant.findOneAndUpdate(
    { ownerId: req.user._id },
    { name, description },
    { new: true }
  );

  if(!restaraunt){
    return res.status(404).json({
      message:"Restaurant not found",
    });
  }
  res.json({
    message:"Restaurant Updated",
    restaurant: restaraunt,   // fixed: was "restaraunt" so frontend got undefined
  })
})


export const getNearbyRestaurant = TryCatch(async(req,res)=>{
const {latitude, longitude, radius = 20000, search } = req.query

if(!latitude || !longitude){
  return res.status(400).json({
    message:"Latitude and longitude are required",
  })
}
const restaurants = await Restaurant.aggregate([
  {
    $geoNear:{
      near:{
        type:"Point",
        coordinates:[Number(longitude), Number(latitude)]
      },
      distanceField:"distance",
      maxDistance: Number(radius),
      spherical:true,
      query: { isVerified: true },
    },
  },
  {
       $sort:{
        isOpen: -1,
        distance:1,
       }
  },
  {
    $addFields:{
      distanceKm:{
        $round:[{$divide:["$distance",1000]},2],
      }
    }
  }
]);

let result = restaurants;
if (typeof search === "string" && search.trim()) {
  // AI relevance search (Grok) — matches on meaning, not just exact name substrings.
  // Falls back to the full nearby list if Grok is unreachable/unconfigured.
  const ids = await rankByRelevance(
    search,
    restaurants.map((r) => ({ id: String(r._id), text: `${r.name}. ${r.description || ""}` }))
  );
  const byId = new Map(restaurants.map((r) => [String(r._id), r]));
  result = ids.map((id) => byId.get(id)).filter(Boolean) as typeof restaurants;
}

res.json({
  success:true,
  count: result.length,
  restaurants: result,
})
})

export const fetchSingleRestaurant =  TryCatch(async(req,res)=>{
  const restaurant = await Restaurant.findById(req.params.id);
  res.json(restaurant);
});