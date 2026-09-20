import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="m-auto max-w-md space-y-4"
    >
      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Add Menu Item</h2>

      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
      />

      <div className="space-y-1.5">
        <textarea
          placeholder="Item description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerateDescription}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition disabled:opacity-50"
        >
          <HiSparkles className="h-3.5 w-3.5" />
          {generating ? "Generating..." : "Generate with AI"}
        </motion.button>
      </div>

      <input
        type="number"
        placeholder="Price ₹"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
        <BiUpload className="h-5 w-5 text-brand" />
        {image ? image.name : "Upload item image"}
        <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </label>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Item"}
      </motion.button>
    </motion.div>
  )
}

export default AddMenuItem