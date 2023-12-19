import React from "react";

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

interface CourseProps {
  course: Course;
}

const CourseCard: React.FC<CourseProps> = ({ course }) => {
  const getTotalVideos = (course: Course): number => {
    return course.units.reduce((total, unit) => total + unit.videos.length, 0);
  };

  return (
    <div className="max-w-sm my-2 mx-auto bg-white border border-gray-200 rounded-lg shadow ">
      <a href="#">
        <img className="rounded-t-lg" src={course.image} alt={course.title} />
      </a>
      <div className="p-5">
        <p className="text-violet-500 text-sm">{course.category.name}</p>
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
            {course.title}
          </h5>
        </a>
        <p className="mb-3 font-normal text-gray-700 ">{course.description}</p>
        <div className="flex justify-between items-center">
          <p className="mb-3 font-normal text-gray-500 ">
            {course.units.length} units
          </p>
          <p className="mb-3 font-normal text-gray-500 ">
            {getTotalVideos(course)} videos
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
