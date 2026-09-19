import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/tryCatch.js";
import Restaurant from "../models/Restaurant.js";
import MenuItems from "../models/MenuItems.js";
import { rankByRelevance } from "../config/groq.js";

export const addMenuItem = TryCatch(async(req:AuthenticatedRequest,res)=>{
  if(!req.user){
    return res.status(401).json({
      message:"Please login",
    });
  }

  const restaraunt = await Restaurant.findOne({ownerId:req.user._id});
  if(!restaraunt){
    return res.status(404).json({
      message:"No Restaurant found",
    });
  }

  const {name, description, price} = req.body;
  if(!name || !price){
    return res.status(400).json({
      message:"Name and price are required",
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
const item = await MenuItems.create({
name,description,price,restaurantId:restaraunt._id,image:uploadResult.url
})
res.json({
  message:"Item Added Successfully",
  item,
})
});

export const getAllItems = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const {id} = req.params;
  const {search} = req.query;
  if(!id){
    return res.status(400).json({
      message:"Id is required",
    });
  }
  const items = await MenuItems.find({restaurantId:id})

  if (typeof search === "string" && search.trim()) {
    // AI relevance search (Grok) — e.g. "spicy" can match "Peri Peri Wings" even
    // without the word appearing in the name/description.
    const ids = await rankByRelevance(
      search,
      items.map((i) => ({ id: String(i._id), text: `${i.name}. ${i.description || ""}` }))
    );
    const byId = new Map(items.map((i) => [String(i._id), i]));
    const filtered = ids.map((itemId) => byId.get(itemId)).filter(Boolean);
    return res.json(filtered);
  }

  res.json(items);
})

export const deleteMenuItem = TryCatch(async(req:AuthenticatedRequest,res)=>{
  if(!req.user){
    return res.status(401).json({
      message:"Please login",
    })
  }

  const {itemId} = req.params;
  if(!itemId){
    return res.status(400).json({
      message:"Id is required",
    });
  }

  const item = await MenuItems.findById(itemId);
  if(!item){
    return res.status(404).json({
      message:"No item found",
    });
  }
  const restaraunt = await Restaurant.findOne({
    _id:item.restaurantId,
    ownerId:req.user._id,
  })

  if(!restaraunt){
    return res.status(404).json({
      message:"No Restaurant Found",
    });
  }

  await item.deleteOne()

  res.json({
    message:"Menu item deleted Succesfully",
  })
});


export const toggleMenuItemAvailability = TryCatch(async(req:AuthenticatedRequest,res)=>{

  if(!req.user){
    return res.status(401).json({
      message:"Please login",
    })
  }

  const {itemId} = req.params;
  if(!itemId){
    return res.status(400).json({
      message:"Id is required",
    });
  }

  const item = await MenuItems.findById(itemId);
  if(!item){
    return res.status(404).json({
      message:"No item found",
    });
  }
  const restaraunt = await Restaurant.findOne({
    _id:item.restaurantId,
    ownerId:req.user._id,
  })

  if(!restaraunt){
    return res.status(404).json({
      message:"No Restaurant Found",
    });
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.json({
    message:`Item Marked as ${item.isAvailable ? "available" : "unavailable"}`, item,
  })
})