import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi2";


function AddMenuItem({ onItemAdded }: {onItemAdded: () => void}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("")
  const [image,setImage] = useState<File|null>(null);
  const [loading,setLoading] = useState(false);
  const [generating,setGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      toast.error("Enter the item name first");
      return;
    }
    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${restaurantService}/api/ai/menu-description`,
        { name, price },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setDescription(data.description);
    } catch (error) {
      console.log(error);
      toast.error("Couldn't generate a description, try again");
    } finally {
      setGenerating(false);
    }
  };


  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async() => {
    if(!name || !price || !image) {
      alert("Name price and image is required");
      return;
    }
    const formData = new FormData();

    formData.append("name",name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file",image);

    try{
      setLoading(true)
      await axios.post(`${restaurantService}/api/item/new`,formData, { headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
    })
    toast.success("Item added successfully")
    resetForm();
    onItemAdded();
    }catch(error:any){
console.log(error);
toast.error("failed to add item")
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className="max-w-md space-y-4 m-auto">
      <h2 className="text-lg font-semibold"> Add Menu Item</h2>
      <input type="text" placeholder="Item-name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none"/>

      <div className="space-y-1">
        <textarea placeholder="item-description" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none" />
        <button
          type="button"
          onClick={handleGenerateDescription}
          disabled={generating}
          className="flex items-center gap-1 text-xs font-medium text-[#E23744] disabled:opacity-50 cursor-pointer"
        >
          <HiSparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate with AI"}
        </button>
      </div>

        <input type="number" placeholder="price ₹" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none"/>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
          <BiUpload className="h-5 w-5 text-[#E23744]"/>
          {image ? image.name : "Upload item image"}
          <input type="file" accept="image/*" hidden onChange={(e)=>setImage(e.target.files?.[0] || null)}/>
        </label>

        <button disabled={loading} onClick={handleSubmit} className="w-full rounded-lg text-white text-sm py-3 font-semibold transition bg-[#E23744] cursor-pointer">{loading ? "Adding..." : "Add Item"}</button>
    </div>
  )
}

export default AddMenuItem