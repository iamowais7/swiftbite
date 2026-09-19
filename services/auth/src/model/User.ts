import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string; 
  image: string;
  name: string;
  role: "customer" | "seller" | "rider" | "admin";
}
const schema: Schema<IUser> = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  image: { type: String, default: null },
  name: { type: String, required: true },
  role: { type: String, default: null },
},{ timestamps: true });

const User = mongoose.model<IUser>("User", schema);

export default User;