import { useState } from "react"
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
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
    <div className="min-h screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
        <h1 className="text-xl font-semibold">Add Your Restaurant</h1>
        <input type="text" placeholder="Restaurant name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none"/>

        <input type="number" placeholder="Contact Number" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none"/>

        <textarea  placeholder="Restaurant Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none"/>

<label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
  <BiUpload className="h-5 w-5 text-[#E23744]"/>
  {image ? image.name : "Upload restaurant image"}
  {/* <input type="file" accept="image/*" hidden onChange={(e)=> setImage(e.target.files?.[0]||null)}/> */}
  <input
  type="file"
  name="file"
  accept="image/*"
  hidden
  onChange={(e) => setImage(e.target.files?.[0] || null)}
/>
</label>

<div className="flex items-start gap-3 rounded-lg border p-4">
  <BiMapPin className="mt-0.5 h-5 w-5 text-[#E23744]"/>
  <div className="text-sm">
    {
      loadingLocation ? "Fetching you location..." : location?.formattedAddress || "Location not available"
    }
  </div>
</div>

<button className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744]" disabled={submitting} onClick={handleSubmit}>
  {submitting ? "Submitting..." : "Add Restaurant"}
</button>
      </div>
    </div>
  )
}

export default AddRestaurant