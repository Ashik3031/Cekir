import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

const ImageSlider = ({ images = [] }) => {

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // useEffect(() => {
  //   if (!isHovered && images.length > 0) {
  //     const interval = setInterval(() => {
  //       setIndex((prevIndex) => (prevIndex + 1) % images.length);
  //     }, 3000);
  //     return () => clearInterval(interval);
  //   }
  // }, [images.length, isHovered]);

  const nextImage = () => setIndex((prevIndex) => (prevIndex + 1) % images.length);
  const prevImage = () => setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

  
  if (images.length === 0) {
    return (
      <Stack justifyContent="center" alignItems="center" height="300px">
        <Typography variant="h6">No images available</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      alignItems="center"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ width: "100%", height: "100%" }}
    >
      <AnimatePresence>
        <motion.img
          key={index}
          src={images[index]}
          alt={`Product ${index}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%",
            objectFit: "contain",
            borderRadius: "8px",
            maxHeight: "500px",
          }}
        />
      </AnimatePresence>

    
      <Button
        onClick={prevImage}
        sx={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          borderRadius: "50%",
          minWidth: "40px",
          height: "40px",
        }}
      >
        <KeyboardArrowLeft />
      </Button>
      <Button
        onClick={nextImage}
        sx={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          borderRadius: "50%",
          minWidth: "40px",
          height: "40px",
        }}
      >
        <KeyboardArrowRight />
      </Button>
    </Stack>
  );
};

export default ImageSlider;
