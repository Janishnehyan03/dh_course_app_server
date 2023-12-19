import React, { ReactNode, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuthContext } from "../contexts/userContext";

interface ProtectedRoutesProps {
  children: ReactNode;
}

function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { authData } = useContext(UserAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if authData is present and the user is authenticated
    if (!localStorage.getItem("token")) {
      // Redirect to the not-allowed page
      navigate("/not-allowed");
    }
  }, [authData, navigate]);

  // If the user is authenticated, render the children
  return authData?.isSignedIn ? <div>{children}</div> : null;
}

export default ProtectedRoutes;
