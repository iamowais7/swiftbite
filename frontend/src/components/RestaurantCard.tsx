import { useNavigate } from "react-router-dom";

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
    <div
      className={`cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md ${
        !isOpen ? "opacity-80" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition duration-300 hover:scale-105 ${
            !isOpen ? "grayscale" : ""
          }`}
        />
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-md bg-black/80 px-3 py-1 text-sm font-semibold text-white">
              Closed
            </span>
          </div>
        )}
      </div>

      {/* Info — outside the image div */}
      <div className="p-3 space-y-0.5">
        <h3 className="truncate text-sm font-semibold text-gray-800">{name}</h3>
        <p className="text-xs text-gray-500">{distance} km away</p>
      </div>
    </div>
  );
}

export default RestaurantCard;
