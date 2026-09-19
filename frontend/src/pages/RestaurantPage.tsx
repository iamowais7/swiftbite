import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { IRestaurant, IMenuItem } from "../types"
import axios from "axios";
import { restaurantService } from "../main";
import ResaurantProfile from "../components/ResaurantProfile"
import MenuItems from "../components/MenuItems";


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
        <div className="text-gray-500">Loading restaurant...</div>
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

      <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
        <input
          type="text"
          placeholder="Search this menu (e.g. 'something spicy')"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />
        <MenuItems isSeller={false} items={menuItems} onItemDeleted={()=>{}}/>
      </div>
    </div>
  )
}

export default RestaurantPage