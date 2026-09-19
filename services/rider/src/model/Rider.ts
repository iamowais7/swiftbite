import mongoose, { Document, Schema } from "mongoose";

export interface IRider extends Document {
  userId: string;

  picture: string;

  phoneNumber: string;

  aadhaarNumber: string;

  drivingLicenseNumber: string;

  isVerified: boolean;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  isAvailable: boolean;

  lastActiveAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IRider>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    picture: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    aadhaarNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    drivingLicenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ location: "2dsphere" });

export const Rider = mongoose.model<IRider>(
  "Rider",
  schema
);