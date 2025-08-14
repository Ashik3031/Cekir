import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosi } from "../../../config/axios";
import { useNavigate } from "react-router-dom";

const SLIDE_DURATION = 4000;
const TRANSITION_DURATION = 400;
const VISIBLE_COUNT = 4;

const HeroSlider = () => {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosi.get("/categories").then((res) => {
      const formatted = res.data
        .filter((cat) => cat.image)
        .map((cat) => ({
          id: cat._id,
          title: cat.name,
          region: "New Arrivals",
          description: cat.description || "Explore the latest collection",
          cards: [
            {
              title: cat.name,
              image: cat.image,
            },
          ],
        }));
      setCategories(formatted);
    });
  }, []);

  const handlePrev = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
  }, [transitioning, categories.length]);

  const handleNext = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setActiveIndex((prev) => (prev + 1) % categories.length);
  }, [transitioning, categories.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [handleNext]);

  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => setTransitioning(false), TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, transitioning]);

  const visibleSlides = [];
  for (let i = 0; i < VISIBLE_COUNT; i++) {
    visibleSlides.push(categories[(activeIndex + i) % categories.length]);
  }

  const activeSlide = visibleSlides[0];
  if (!activeSlide) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${activeSlide.id}`}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${activeSlide.cards[0].image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>

      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40 z-5" />

      <div className="relative z-10 h-full w-full px-6 md:px-16 py-12 md:py-16 flex flex-col justify-between text-white">
        <div className="h-16" />

        {/* Desktop & Large Tablet View */}
        <div className="hidden lg:flex flex-row items-end justify-between w-full h-full mt-6 gap-4">
          <motion.div
            key={`text-${activeSlide.id}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="max-w-[520px] mb-24 flex-shrink-0"
          >
            <h2 className="text-sm uppercase tracking-widest text-white/90 mb-2 font-medium">
              {activeSlide.region}
            </h2>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
              {activeSlide.title}
            </h1>
            <div className="mb-6 text-base md:text-lg text-white/95 leading-relaxed">
              {activeSlide.description}
            </div>
            <button
              className="mt-4 px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg backdrop-blur-sm"
              onClick={() => {
                navigate(`/categories?categoryId=${activeSlide.id}`);
              }}
            >
              View Collection
            </button>
          </motion.div>

          <motion.div
            key={`cards-${activeSlide.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
            className="flex gap-4 md:gap-6 items-end mb-16 flex-shrink-0"
          >
            {visibleSlides.map((item, index) => {
              const isActive = index === 0;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.08 }}
                  onClick={() =>
                    !transitioning &&
                    setActiveIndex((activeIndex + index) % categories.length)
                  }
                  className={`relative w-36 md:w-44 h-52 md:h-64 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 ${
                    isActive
                      ? "opacity-100 scale-110 z-20 pointer-events-none ring-4 ring-white/50"
                      : "opacity-70 scale-90 z-10 pointer-events-auto hover:opacity-90"
                  }`}
                  tabIndex={isActive ? -1 : 0}
                >
                  <img
                    src={item.cards[0].image}
                    alt={item.cards[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white text-center text-xs md:text-sm font-semibold py-3">
                    {item.cards[0].title}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile & Tablet View */}
        <div className="flex lg:hidden flex-col justify-end h-full">
          <div className="flex items-end justify-between w-full gap-4 mb-6">
            {/* Content */}
            <motion.div
              key={`text-${activeSlide.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-[65%]"
            >
              <h2 className="text-xs uppercase tracking-widest text-white/90 mb-1 font-medium">
                {activeSlide.region}
              </h2>
              <h1 className="text-2xl font-extrabold leading-tight mb-2 text-white drop-shadow-lg">
                {activeSlide.title}
              </h1>
              <p className="text-sm text-white/95 mb-3 leading-relaxed">{activeSlide.description}</p>
              <button
                className="px-6 py-2.5 rounded-full border-2 border-white text-white text-sm font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg backdrop-blur-sm"
                onClick={() => navigate(`/categories?categoryId=${activeSlide.id}`)}
              >
                View Collection
              </button>
            </motion.div>

            {/* Small Card */}
            <motion.div
              key={`card-${activeSlide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="w-[32%] h-36 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/30"
            >
              <img
                src={activeSlide.cards[0].image}
                alt={activeSlide.cards[0].title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* Prev/Next Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={transitioning}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 hover:bg-white/20 hover:border-white/50 flex items-center justify-center text-white text-lg transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              &#8592;
            </button>
            <button
              onClick={handleNext}
              disabled={transitioning}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 hover:bg-white/20 hover:border-white/50 flex items-center justify-center text-white text-lg transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              &#8594;
            </button>
          </div>
          <div className="text-base font-bold pr-6 select-none bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
            {String((activeIndex % categories.length) + 1).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;