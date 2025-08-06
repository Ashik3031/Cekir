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

      <div className="relative z-10 h-full w-full px-6 md:px-16 py-12 md:py-16 flex flex-col justify-between text-white">
        <div className="h-16" />

        {/* Desktop & Tablet View */}
        <div className="hidden sm:flex flex-col md:flex-row items-end justify-between w-full h-full mt-6">
          <motion.div
            key={`text-${activeSlide.id}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="max-w-[520px] mb-10 md:mb-24"
          >
            <h2 className="text-sm uppercase tracking-widest opacity-70 mb-2">
              {activeSlide.region}
            </h2>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              {activeSlide.title}
            </h1>
            <div className="mb-6 text-base md:text-lg text-white/90">
              {activeSlide.description}
            </div>
            <button
              className="mt-4 px-6 py-2 rounded-full border border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition"
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
            className="flex gap-4 md:gap-6 items-end mb-10 md:mb-16 overflow-x-auto"
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
                  className={`relative min-w-[150px] md:w-44 h-60 md:h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-500 ${
                    isActive
                      ? "opacity-100 scale-110 z-20 pointer-events-none"
                      : "opacity-60 scale-90 z-10 pointer-events-auto"
                  }`}
                  tabIndex={isActive ? -1 : 0}
                >
                  <img
                    src={item.cards[0].image}
                    alt={item.cards[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black/60 text-white text-center text-xs md:text-sm font-semibold py-2">
                    {item.cards[0].title}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile View */}
        <div className="flex sm:hidden flex-col justify-end h-full">
          <div className="flex items-end justify-between w-full gap-4 mb-6">
            {/* Content */}
            <motion.div
              key={`text-${activeSlide.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-[70%]"
            >
              <h2 className="text-xs uppercase tracking-widest opacity-70 mb-1">
                {activeSlide.region}
              </h2>
              <h1 className="text-2xl font-extrabold leading-tight mb-2">
                {activeSlide.title}
              </h1>
              <p className="text-sm text-white/90 mb-3">{activeSlide.description}</p>
              <button
                className="px-4 py-2 rounded-full border border-white text-white text-sm font-semibold hover:bg-white hover:text-gray-900 transition"
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
              className="w-[28%] h-32 rounded-xl overflow-hidden shadow-lg"
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
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg"
            >
              &#8592;
            </button>
            <button
              onClick={handleNext}
              disabled={transitioning}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg"
            >
              &#8594;
            </button>
          </div>
          <div className="text-base font-semibold pr-6 select-none">
            {String((activeIndex % categories.length) + 1).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
