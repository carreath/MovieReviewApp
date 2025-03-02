import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface RequireUserProps {
  children: JSX.Element;
}

const RequireUser: React.FC<RequireUserProps> = ({ children }) => {
  // Check if the 'user' cookie is set
  const userCookie = Cookies.get("user");

  if (!userCookie) {
    // Redirect to the choose user page if cookie is unset
    return <Navigate to="/user-select" replace />;
  }

  return children;
};

export default RequireUser;
