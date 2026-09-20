import { useState } from "react"
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

interface props{
  fetchMyRestaurant:()=>Promise<void>;
}

function AddRestaurant({ fetchMyRestaurant }:props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File|null>(null);
  const [submitting, setSubmitting] = useState(false)

  const {loadingLocation, location} = useAppData()
  const handleSubmit = async()=>{
    if(!name || !image || !location) {
      alert("All field are required");
      return;
    }
    const formData = new FormData()
    formData.append("name",name)
    formData.append("description",description)
    formData.append("latitude",String(location.latitude))
    formData.append("longitude",String(location.longitude))
    formData.append("formattedAddress",location.formattedAddress)
    formData.append("file",image);
    formData.append("phone",phone);
    try{
        setSubmitting(true)
        await axios.post(`${restaurantService}/api/restaurant/new`,formData,{
          headers:{
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        toast.success("Restaurant Added Successfully");
        fetchMyRestaurant();
    }catch(error:any){
     toast.error(error.response.data.message)
    }finally{
      setSubmitting(false);
    }
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white px-4 py-10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mx-auto max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
      >
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Add Your Restaurant</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tell us a bit about your restaurant to get started</p>
        </div>

        <input
          type="text"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />

        <input
          type="number"
          placeholder="Contact Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />

        <textarea
          placeholder="Restaurant Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          <BiUpload className="h-5 w-5 text-brand" />
          {image ? image.name : "Upload restaurant image"}
          <input
            type="file"
            name="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <BiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {loadingLocation ? "Fetching you location..." : location?.formattedAddress || "Location not available"}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Add Restaurant"}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default AddRestaurant