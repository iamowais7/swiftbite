import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiSolidMap } from "react-icons/bi";

interface Props {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
}

function RestaurantCard({ id, image, name, distance, isOpen }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(226,55,68,0.18)] ${
        !isOpen ? "opacity-80" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${
            !isOpen ? "grayscale" : ""
          }`}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-black/0" />

        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold tracking-wide text-white">
              CLOSED
            </span>
          </div>
        )}

        {isOpen && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-brand backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            OPEN
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 p-3.5">
        <h3 className="truncate text-[15px] font-bold text-gray-900">{name}</h3>
        <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <BiSolidMap className="h-3.5 w-3.5 text-brand" />
          {distance} km away
        </p>
      </div>
    </motion.div>
  );
}

export default RestaurantCard;
