import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { IRestaurant, IMenuItem } from "../types"
import axios from "axios";
import { motion } from "framer-motion";
import { restaurantService } from "../main";
import ResaurantProfile from "../components/ResaurantProfile"
import MenuItems from "../components/MenuItems";
import { BiSearch } from "react-icons/bi";


function RestaurantPage() {
  const {id} = useParams()
  const [restaurant, setRestaurant] = useState<IRestaurant| null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRestaurant = async()=>{
    try{
      const {data} = await axios.get(`${restaurantService}/api/restaurant/${id}`,{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`,
        }
      });
      setRestaurant(data || null) ;
    }catch(error){
      console.log(error);
    }finally{
      setLoading(false);
    }
  };

  const fetchMenuItems = async() => {
    try{
      const { data } = await axios.get(`${restaurantService}/api/item/all/${id}`,{
        params: search.trim() ? { search } : {},
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMenuItems(data);
    }catch(error){
      console.log(error);
    }
  }

  useEffect(()=>{
if(id){
  fetchRestaurant();
}
  },[id]);

  useEffect(()=>{
    if(!id) return;
    const timer = setTimeout(fetchMenuItems, 400);
    return () => clearTimeout(timer);
  },[id, search]);

  if(loading){
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if(!restaurant){
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500"> No Restaurant with this id </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <ResaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={false}/>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-auto max-w-6xl rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-5 space-y-5"
      >
        <div className="relative">
          <BiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search this menu (e.g. &quot;something spicy&quot;)"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <MenuItems isSeller={false} items={menuItems} onItemDeleted={()=>{}}/>
      </motion.div>
    </div>
  )
}

export default RestaurantPage
