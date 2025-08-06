import {
  Box,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ecommerceOutlookAnimation,
  shoppingBagAnimation,
} from "../../../assets";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
import {
  selectLoggedInUser,
  loginAsync,
  selectLoginStatus,
  selectLoginError,
  clearLoginError,
  resetLoginStatus,
} from "../AuthSlice";
import { toast } from "react-toastify";
import { MotionConfig, motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const Login = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectLoginStatus);
  const error = useSelector(selectLoginError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  // 3D Panda states
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const formRef = useRef(null);

  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser?.isAdmin) {
        navigate("/admin/dashboard");
      } else if (loggedInUser?.isVerified) {
        navigate("/");
      } else {
        navigate("/verify-otp");
      }
    }
  });

  // handles login error and toast them
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  console.log(loggedInUser);

  // handles login status and dispatches reset actions to relevant states in cleanup
  useEffect(() => {
    if (status === "fullfilled" && loggedInUser?.isVerified === true) {
      toast.success(`Login successful`);
      reset();
    }
    return () => {
      dispatch(clearLoginError());
      dispatch(resetLoginStatus());
    };
  }, [status]);

  // Eye tracking effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (formRef.current && !isPasswordFocused) {
        const rect = formRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);
        
        setEyePosition({ 
          x: Math.max(-1, Math.min(1, x)), 
          y: Math.max(-1, Math.min(1, y)) 
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPasswordFocused]);

  const handleLogin = (data) => {
    const cred = { ...data };
    delete cred.confirmPassword;
    dispatch(loginAsync(cred));
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // 3D Panda Component
  const PandaFace = () => {
    return (
      <motion.div 
        className="relative w-32 h-32 mx-auto mb-8"
       
        transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
      >
        {/* Panda Head */}
        <div 
          className="absolute inset-0 bg-white rounded-full shadow-2xl border-4 border-gray-200"
          style={{ 
            transform: 'perspective(1000px) rotateX(10deg)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          {/* Ears */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full shadow-lg"
               style={{ transform: 'perspective(500px) rotateX(20deg)' }}></div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-black rounded-full shadow-lg"
               style={{ transform: 'perspective(500px) rotateX(20deg)' }}></div>
          
          {/* Inner ears */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink-200 rounded-full"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-200 rounded-full"></div>
          
          {/* Eyes */}
          <div className="absolute top-8 left-6 w-6 h-6 bg-black rounded-full overflow-hidden shadow-inner">
            {!isPasswordFocused && (
              <motion.div 
                className="w-2 h-2 bg-white rounded-full absolute top-1"
                animate={{ 
                  left: `${12 + eyePosition.x * 8}px`,
                  top: `${8 + eyePosition.y * 4}px`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {isPasswordFocused && (
              <motion.div 
                className="w-full h-1 bg-black absolute top-3"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0.1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          <div className="absolute top-8 right-6 w-6 h-6 bg-black rounded-full overflow-hidden shadow-inner">
            {!isPasswordFocused && (
              <motion.div 
                className="w-2 h-2 bg-white rounded-full absolute top-1"
                animate={{ 
                  left: `${12 + eyePosition.x * 8}px`,
                  top: `${8 + eyePosition.y * 4}px`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {isPasswordFocused && (
              <motion.div 
                className="w-full h-1 bg-black absolute top-3"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0.1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          {/* Eye patches */}
          <div className="absolute top-6 left-4 w-10 h-10 bg-black rounded-full opacity-20 blur-sm"></div>
          <div className="absolute top-6 right-4 w-10 h-10 bg-black rounded-full opacity-20 blur-sm"></div>
          
          {/* Nose */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-black rounded-full shadow-sm"></div>
          
          {/* Mouth */}
          <motion.div 
  className="absolute top-20 left-2/4 transform -translate-x-1/2 w-4 h-2 border-b-2 border-black rounded-b-full"
  animate={{ 
    scale: isPasswordFocused ? 0.8 : 1,
    y: isPasswordFocused ? 2 : 0
  }}
  transition={{ duration: 0.3 }}
/>

          
          {/* Cheek blush */}
          <div className="absolute top-12 left-2 w-3 h-2 bg-pink-200 rounded-full opacity-60"></div>
          <div className="absolute top-12 right-2 w-3 h-2 bg-pink-200 rounded-full opacity-60"></div>
        </div>
        
        {/* 3D shadow */}
        <div 
          className="absolute inset-0 bg-gray-300 rounded-full blur-md opacity-30"
          style={{ transform: 'perspective(1000px) rotateX(85deg) translateZ(-10px)' }}
        ></div>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Floating background elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "100px",
          height: "100px",
          background: "rgba(0,0,0,0.03)",
          borderRadius: "50%",
          filter: "blur(20px)"
        }}
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: "absolute",
          top: "60%",
          right: "10%",
          width: "150px",
          height: "150px",
          background: "rgba(0,0,0,0.02)",
          borderRadius: "50%",
          filter: "blur(25px)"
        }}
      />

      <Stack 
        width="100%"
        justifyContent={"center"} 
        alignItems={"center"}
        ref={formRef}
        sx={{ position: "relative", zIndex: 1 }}
      >
        {/* 3D Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "32px",
            padding: "40px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.12), 0 0 40px rgba(0,0,0,0.05)",
            border: "1px solid rgba(255,255,255,0.2)",
            transform: "perspective(1000px)",
            width: is480 ? "95vw" : "28rem",
            maxWidth: "500px"
          }}
        >
          {/* 3D Panda */}
          <PandaFace />

          {/* Brand */}
          <Stack
            flexDirection={"row"}
            justifyContent={"center"}
            alignItems={"center"}
            mb={4}
          >
            <Stack rowGap={".4rem"}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Typography
                  variant="h2"
                  sx={{ 
                    wordBreak: "break-word",
                    background: "linear-gradient(135deg, #2c3e50, #34495e)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textAlign: "center"
                  }}
                  fontWeight={700}
                >
                  Cekir
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Typography
                  alignSelf={"center"}
                  color={"#666"}
                  variant="body2"
                  sx={{ textAlign: "center", fontWeight: 500 }}
                >
                 
                </Typography>
              </motion.div>
            </Stack>
          </Stack>

          <Stack
            spacing={3}
            component={"form"}
            noValidate
            onSubmit={handleSubmit(handleLogin)}
          >
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TextField
                fullWidth
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value:
                      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                    message: "Enter a valid email",
                  },
                })}
                placeholder="Email"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#f8f9fa",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#fff",
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      borderColor: "#2c3e50",
                      boxShadow: "0 8px 25px rgba(44,62,80,0.15)"
                    }
                  }
                }}
              />
              {errors.email && (
                <FormHelperText sx={{ mt: 1, ml: 1 }} error>
                  {errors.email.message}
                </FormHelperText>
              )}
            </motion.div>

            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TextField
                type={showPassword ? "text" : "password"}
                fullWidth
                {...register("password", { required: "Password is required" })}
                placeholder="Password"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleTogglePassword} 
                        edge="end"
                        sx={{
                          color: "#666",
                          "&:hover": { color: "#2c3e50" }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#f8f9fa",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#fff",
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      borderColor: "#2c3e50",
                      boxShadow: "0 8px 25px rgba(44,62,80,0.15)"
                    }
                  }
                }}
              />
              {errors.password && (
                <FormHelperText sx={{ mt: 1, ml: 1 }} error>
                  {errors.password.message}
                </FormHelperText>
              )}
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <LoadingButton
                fullWidth
                sx={{ 
                  height: "3rem",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #2c3e50, #34495e)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  boxShadow: "0 8px 25px rgba(44,62,80,0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #34495e, #2c3e50)",
                    boxShadow: "0 12px 35px rgba(44,62,80,0.4)",
                    transform: "translateY(-2px)"
                  },
                  "&:active": {
                    transform: "translateY(0px)"
                  }
                }}
                loading={status === "pending"}
                type="submit"
                variant="contained"
              >
                Login
              </LoadingButton>
            </motion.div>

            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
              flexWrap={"wrap-reverse"}
              mt={2}
            >
              <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.05 }}>
                <motion.div>
                  <Typography
                    mr={"1.5rem"}
                    sx={{ 
                      textDecoration: "none", 
                      color: "#666",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      "&:hover": { color: "#2c3e50" },
                      transition: "color 0.2s ease"
                    }}
                    to={"/forgot-password"}
                    component={Link}
                  >
                    Forgot password?
                  </Typography>
                </motion.div>

                <motion.div>
                  <Typography
                    sx={{ 
                      textDecoration: "none", 
                      color: "#666",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      "&:hover": { color: "#2c3e50" },
                      transition: "color 0.2s ease"
                    }}
                    to={"/signup"}
                    component={Link}
                  >
                    Don't have an account?{" "}
                    <span style={{ 
                      color: "#2c3e50", 
                      fontWeight: 600,
                      textDecoration: "underline" 
                    }}>
                      Register
                    </span>
                  </Typography>
                </motion.div>
              </MotionConfig>
            </Stack>
          </Stack>
        </motion.div>
      </Stack>
    </Box>
  );
};