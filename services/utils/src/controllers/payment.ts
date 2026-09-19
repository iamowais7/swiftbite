import axios from "axios";
import { Request, Response } from "express"
import { razorpay } from "../config/razorpay.js";
import { verifyRazorpaySignature } from "../config/verifyRazorpay.js";
import { publishPaymentSuccess } from "../config/payment.producer.js";
export const createRazorpayOrder = async(req:Request, res:Response)=>{

  const {orderId} = req.body;
  const {data} = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,{
    headers:{
      "x-internal-key":process.env.INTERNAL_SERVICE_KEY,
    },
  }
)
const razorpayOrder = await razorpay.orders.create({
amount:data.amount*100,
currency:"INR",
receipt:orderId,
});
res.json({
  razorpayOrderId:razorpayOrder.id,
  key:process.env.RAZORPAY_KEY_ID,
})
};

export const verifyRazorpayPayment = async(req:Request, res:Response)=>{
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature,orderId} = req.body;
  const isValid = verifyRazorpaySignature(razorpay_order_id,razorpay_payment_id,razorpay_signature);
  if(!isValid){
    return res.status(400).json({
      message:"Payment verification failed",
    })
  }
  await publishPaymentSuccess({
    orderId,
    payment: razorpay_payment_id,
    provider: "razorpay",
  });
  res.json({
    message:"Payment verified successfully",
  })
}

import dotenv from "dotenv"
dotenv.config()
import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
console.log(process.env.STRIPE_SECRET_KEY);
export const payWithStripe = async(req:Request,res:Response)=>{
  try{
    const {orderId} = req.body;
    const {data} = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,{
      headers:{
        "x-internal-key":process.env.INTERNAL_SERVICE_KEY,
      }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      mode: "payment",
      line_items:[
        {
          price_data:{
            currency:"inr",
            product_data:{
              name:"SwiftBite food order",
            },
            unit_amount:data.amount*100,
          },
          quantity:1,
        }
      ],
      metadata:{
        orderId,
      },
      success_url:`${process.env.FRONTEND_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    })
    res.json({
      url:session.url,
    });
  }catch (error: any) {
    console.error("STRIPE ERROR:", error);
  
    res.status(500).json({
      message: error?.message || "stripe payment failed",
      stripeError: error,
    });
  }
}

export const verifyStripe = async(req:Request, res:Response)=>{
  const {sessionId} = req.body;
  try{
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if(!session){
      return res.status(400).json({
        message:"Payment verification failed",
      });
    }
    const orderId = session.metadata?.orderId
    if(!orderId){
      return res.status(400).json({
        message:"Order not found in stripe session",
      });
    }
    await publishPaymentSuccess({
      orderId, payment:sessionId, provider:"stripe",
    });
    res.json({
      message:"Payment verify successfully"
    })
  }catch(error){
    res.status(500).json({
      message:"stripe payment failed",
    });
  }
}

