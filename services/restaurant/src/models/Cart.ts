import mongoose, { Document, Schema } from "mongoose";

export interface ICart extends Document{
userId: mongoose.Types.ObjectId;
restaurantId: mongoose.Types.ObjectId;
itemId:mongoose.Types.ObjectId;
quantity:number;
createdAt:Date;
updatedAt:Date;
}

const schema = new Schema<ICart>({
  userId:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
  },
  restaurantId:{
    type: Schema.Types.ObjectId,
    ref:"Restaurant",
    required:true,
    index:true
  },
  itemId:{
    type: Schema.Types.ObjectId,
    ref:"MenuItem",
    required:true,
    index:true
  },
  quantity:{
    type:Number,
    default:1,
    min:1,
  },
},{
  timestamps:true,
})

schema.index({userId:1, restaurantId:1, itemId:1},{unique:true})

export default mongoose.model<ICart>("Cart", schema);