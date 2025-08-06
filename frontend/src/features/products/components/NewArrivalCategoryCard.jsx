import { useNavigate } from "react-router-dom";

const CategoryCard = ({ title, buttonText, image }) => {
  const navigate = useNavigate();

  return (
    <div className="relative group w-full  h-[500px] overflow-hidden">
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-xl font-semibold mb-4">{title}</h3>
        <button
          className="px-6 py-2 bg-white text-black font-medium text-sm tracking-wide"
          onClick={() => navigate(`/new-arrivals/${title}`)} 
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
