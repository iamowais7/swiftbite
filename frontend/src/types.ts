export interface User{
  _id:string;
  name:string;
  email:string;
  image:string;
  role:string;
}

export interface LocationData{
  latitude:number;
  longitude:number;
  formattedAddress:string;
}

export interface AppContextType{
  user:User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  location:LocationData | null;
  loadingLocation:boolean;
  city:string;
  cart:ICart[]| null;
  fetchCart:()=>Promise<void>;
  refreshUser:()=>Promise<void>;
  subTotal:number;
  quantity:number;
}

export interface IRestaurant {
  _id:string,
  name:string;
  description:string;
  image:string;
  ownerId:string;
  phone:number;
  isVerified:boolean;

  autoLocation:{
    type:"Point",
    coordinates:[number,number]; 
    formattedAddress:string;
  };
  isOpen:boolean;
  createdAt:Date;
}

export interface IMenuItem {
  _id:string,
  restaurantId: string;
  name:string;
  description:string;
  image?:string;
  price:number;
  isAvailable:boolean;
  createdAt:Date;
  updatedAt:Date;
}

export interface ICart {
  _id:string,
  userId: String;
  restaurantId: String | IRestaurant;
  itemId:String | IMenuItem;
  quantity:number;
  createdAt:Date;
  updatedAt:Date;
  }

export interface IOrder {
  _id:string;
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

