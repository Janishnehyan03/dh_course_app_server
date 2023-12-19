import React from "react";
import Courses from "../components/Courses";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div>
      <div className="bg-blue-500 p-3 max-w-md mx-auto mt-3">
        <Link to={`/create-course`}>
          <h1 className="text-center text-white">Create New Course</h1>
        </Link>
      </div>
      <Courses />
    </div>
  );
}

export default HomePage;
