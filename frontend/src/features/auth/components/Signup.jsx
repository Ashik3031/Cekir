/* eslint-disable no-unused-vars */
import {
  FormHelperText,
  Stack,
  TextField,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
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
  signupAsync,
  selectSignupStatus,
  selectSignupError,
  clearSignupError,
  resetSignupStatus,
} from "../AuthSlice";
import { toast } from "react-toastify";
import { MotionConfig, motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const Signup = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectSignupStatus);
  const error = useSelector(selectSignupError);
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

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // handles user redirection
  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp");
    } else if (loggedInUser) {
      navigate("/");
    }
  }, [loggedInUser]);

  // handles signup error and toast them
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (status === "fullfilled") {
      toast.success(
        "Welcome! Verify your email to start shopping on mern-ecommerce."
      );
      reset();
    }
    return () => {
      dispatch(clearSignupError());
      dispatch(resetSignupStatus());
    };
  }, [status]);

  // this function handles signup and dispatches the signup action with credentails that api requires
  const handleSignup = (data) => {
    const cred = { ...data };
    delete cred.confirmPassword;
    dispatch(signupAsync(cred));
  };

  const muiInputStyle = {
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
      sx={{ position: "relative", zIndex: 1 }}
    >
      {/* 3D Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
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
               cekir
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
                - Shop Anything
              </Typography>
            </motion.div>
          </Stack>
        </Stack>

        <Stack
          spacing={3}
          component={"form"}
          noValidate
          onSubmit={handleSubmit(handleSignup)}
        >
          <MotionConfig whileHover={{ y: -2, scale: 1.01 }}>
            <motion.div>
              <TextField
                fullWidth
                {...register("name", { required: "Username is required" })}
                placeholder="Username"
                sx={muiInputStyle}
              />
              {errors.name && (
                <FormHelperText sx={{ mt: 1, ml: 1 }} error>
                  {errors.name.message}
                </FormHelperText>
              )}
            </motion.div>

            <motion.div>
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
                sx={muiInputStyle}
              />
              {errors.email && (
                <FormHelperText sx={{ mt: 1, ml: 1 }} error>
                  {errors.email.message}
                </FormHelperText>
              )}
            </motion.div>

            <motion.div>
              <TextField
                fullWidth
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                    message:
                      "At least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
                  },
                })}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleClickShowPassword}
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
                sx={muiInputStyle}
              />
              {errors.password && (
                <FormHelperText sx={{ mt: 1, ml: 1 }} error>
                  {errors.password.message}
                </FormHelperText>
              )}
            </motion.div>

            <motion.div>
              <TextField
                fullWidth
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value, fromValues) =>
                    value === fromValues.password || "Passwords don't match",
                })}
                placeholder="Confirm Password"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleClickShowPassword}
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
                sx={muiInputStyle}
              />
              {errors.confirmPassword && (
                <FormHelperText sx={{ mt: 1, ml: 1 }} error>
                  {errors.confirmPassword.message}
                </FormHelperText>
              )}
            </motion.div>
          </MotionConfig>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
              Signup
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
                  to={"/login"}
                  component={Link}
                >
                  Already a member?{" "}
                  <span style={{ 
                    color: "#2c3e50", 
                    fontWeight: 600,
                    textDecoration: "underline" 
                  }}>
                    Login
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
}