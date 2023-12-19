import { createContext, ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Axios from "../utils/Axios";

interface AuthData {
  user: object;
  isSignedIn?: boolean;
  token?: string;
}

interface UserAuthContextType {
  checkUserLogin: () => Promise<void>;
  authData: AuthData | null;
  isSignedIn?: boolean; // Make it optional
  setAuthData: React.Dispatch<React.SetStateAction<AuthData | null>>;
  logout: () => Promise<void>;
  token?: string; // Make it optional
}

export const UserAuthContext = createContext<UserAuthContextType>({
  checkUserLogin: async () => {},
  authData: null,
  setAuthData: () => {},
  logout: async () => {},
  isSignedIn: false, // Provide a default value or make it optional
  token: undefined, // Initialize with undefined
});

export const UserAuthProvider = (props: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const { pathname } = useLocation();

  const checkUserLogin = async () => {
    try {
      const res = await Axios.post("/auth/check-login");
      if (res.status === 200) {
        setAuthData({
          user: res.data.user,
          isSignedIn: true,
          token: res.data.token,
        });
      }
    } catch (error) {
      const err = error as any;
      console.log(err.response.data);
    }
  };

  const logout = async () => {
    try {
      const res = await Axios.post("/auth/logout");
      if (res.data.success) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch (error) {
      const err = error as any;
      console.log(err.response);
    }
  };

  const value: UserAuthContextType = {
    checkUserLogin,
    authData,
    setAuthData,
    logout,
    isSignedIn: false, // Provide a default value or make it optional
    token: undefined, // Initialize with undefined
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <UserAuthContext.Provider value={value}>
      {props.children}
    </UserAuthContext.Provider>
  );
};
