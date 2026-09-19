import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/tryCatch.js";
import Address from "../models/Address.js";

export const addAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      mobile,
      formattedAddress,
      latitude,
      longitude,
    } = req.body;

    if (
      !mobile ||
      !formattedAddress ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Please give all fields",
      });
    }

    const newAddress = await Address.create({
      userId: user._id.toString(),
      mobile: Number(mobile),
      formattedAddress,
      location: {
        type: "Point",
        coordinates: [
          Number(longitude),
          Number(latitude),
        ],
      },
    });

    res.status(201).json({
      message: "Address Added Successfully",
      address: newAddress,
    });
  }
);

export const deleteAddress = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const user = req.user;
  if(!user){
    return res.status(401).json({
      message:"Unauthorized",
    });
  }

  const {id} = req.params
  if(!id){
    return res.status(400).json({
      message:"id is required",
    });
  }

  const addresss  = await Address.findOne({
    _id:id,
    userId:user._id.toString()
  })
  if(!addresss){
     return res.status(404).json({
      message:"Address not found"
     })
  }
  await addresss.deleteOne()
  res.json({
    message:"Address deleted Successfully",
  })
})

export const getMyAddresses = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const user = req.user;
  if(!user){
    return res.status(401).json({
      message:"Unauthorized",
    });
  }
  const addresses = await Address.find({
    userId: user._id.toString(),
  }).sort({createdAt: -1});

  res.json(addresses)
})