import {ObjectId} from "mongodb"
import TryCatch from "../middleware/trycatch.js"
import { getRestaurantCollection,getRiderCollection } from "../utils/collection.js"

export const getPendingRestaurant = TryCatch(async(req , res)=>{
  const restauraunts = await (await getRestaurantCollection()).find({isVerified:false}).toArray();

  res.json({
    count:restauraunts.length,
    restauraunts,
  })
})

export const getPendingRider = TryCatch(async(req , res)=>{
  const riders = await (await getRiderCollection()).find({isVerified:false}).toArray();

  res.json({
    count:riders.length,
    riders,
  })
})

export const verifyRestaurant = TryCatch(async(req , res)=>{
  const {id} = req.params;
  if(typeof id !== "string"){
    return res.status(400).json({
      message:'Invalid restaurant id',
    });
  }
  if(!ObjectId.isValid(id)){
    return res.status(400).json({
      message:'Invalid object id',
    });
  }
  const result = await (
    await getRestaurantCollection()
  ).updateOne(
    {_id:new ObjectId(id)},
    {
      $set:{
        isVerified:true,
        updatdAt:new Date(),
      }
    }
  )
  if(result.matchedCount === 0){
    return res.status(404).json({
      message:"Restaurant not found",
    });
  }
  res.json({
    message:"Restaurant verified successfully",
  })
});


export const verifyRider = TryCatch(async(req , res)=>{
  const {id} = req.params;
  if(typeof id !== "string"){
    return res.status(400).json({
      message:'Invalid rider id',
    });
  }
  if(!ObjectId.isValid(id)){
    return res.status(400).json({
      message:'Invalid object id',
    });
  }
  const result = await (
    await getRiderCollection()
  ).updateOne(
    {_id:new ObjectId(id)},
    {
      $set:{
        isVerified:true,
        updatdAt:new Date(),
      }
    }
  )
  if(result.matchedCount === 0){
    return res.status(404).json({
      message:"Rider not found",
    });
  }
  res.json({
    message:"Rider verified successfully",
  })
});