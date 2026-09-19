import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  restaurantId: string;
  restaurantName: string;

  riderId?: string | null;
  riderPhone: number | null;
  riderName: string | null;

  distance: number;
  riderAmount: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subTotal: number;
  deliveryFee: number;
  platfromFee: number;
  totalAmount: number;

  addressId: string;

  deliveryAddress: {
    formattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe";

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
    },

    restaurantId: {
      type: String,
      required: true,
    },

    restaurantName: {
      type: String,
      required: true,
    },

    riderId: {
      type: String,
      default: null,
    },

    riderPhone: {
      type: Number,
      default: null,
    },

    riderName: {
      type: String,
      default: null,
    },

    distance: {
      type: Number,
      required: true,
    },

    riderAmount: {
      type: Number,
      required: true,
    },

    items: [
      {
        itemId: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    subTotal: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      required: true,
    },

    platfromFee: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    addressId: {
      type: String,
      required: true,
    },

    deliveryAddress: {
      formattedAddress: {
        type: String,
        required: true,
      },

      mobile: {
        type: Number,
        required: true,
      },

      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready_for_rider",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled",
      ],

      default: "placed",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      index: {
        expireAfterSeconds: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>(
  "Order",
  OrderSchema
);
