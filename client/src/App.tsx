import React, { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { UserAuthContext } from "./contexts/userContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoutes from "./pages/Restricted";
import CreateCourse from "./components/CreateCourse";

const App: React.FC = () => {
  const { checkUserLogin } = useContext(UserAuthContext);
  useEffect(() => {
    checkUserLogin();
  }, []);
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <HomePage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/create-course"
          element={
            <ProtectedRoutes>
              <CreateCourse />
            </ProtectedRoutes>
          }
        />

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default App;
