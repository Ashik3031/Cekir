import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutAsync, selectLoggedInUser } from "../AuthSlice";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();

  useEffect(() => {
    const removeCookie = (name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    // Remove the token from cookies
    removeCookie("token");
    dispatch(logoutAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
    }
  }, [loggedInUser]);

  return <></>;
};
