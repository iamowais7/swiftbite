import express from "express"
import {getIo as getIO} from "../socket.js"

const router = express.Router()
router.post("/emit",(req , res) => {
  if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY){
    return res.status(403).json({
      message:"Forbidden",
    });
  }
  const {event, room, payload} = req.body;
  if(!event || !room){
    return res.status(400).json({
      message:"Event and room are required",
    });
  }
  const io = getIO();
  console.log(`Emitting event ${event} to room ${room}`);
  io.to(room).emit(event,payload ?? {});
  return res.json({success:true});
})
export default router;