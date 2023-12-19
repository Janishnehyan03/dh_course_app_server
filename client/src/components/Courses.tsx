import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import Axios from "../utils/Axios";
import Loading from "./Loading";

interface Course {
  _id: string;
  title: string;
  description: string;
  image: string;
  units: Unit[];
  category: Category;
}

interface Unit {
  _id: string;
  title: string;
  description: string;
  videos: Video[];
}

interface Video {
  _id: string;
  title: string;
  videoUrl: string;
  description: string;
  notes: any[]; // You might want to define a more specific type for notes
}

interface Category {
  _id: string;
  deleted: boolean;
  name: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getCourses = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get<{ courses: Course[] }>("/course");
      setLoading(false);
      setCourses(data.courses);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <div>
      <h1 className="text-center font-bold text-violet-700 text-4xl my-6">
        Our Courses
      </h1>
      <div className="lg:grid lg:grid-cols-3">
        {!loading ? (
          courses.map((course, key) => (
            // Assuming CourseCard expects a course prop
            <CourseCard course={course} key={key} />
          ))
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default Courses;
