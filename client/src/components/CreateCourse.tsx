import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Axios from "../utils/Axios";

interface Unit {
  title: string;
  description: string;
}
interface Category {
  name: string;
  _id: string;
}

interface Course {
  title: string;
  category: string;
  image: string;
  description: string;
  units: Unit[];
  price: number;
}

const CreateCourseForm: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [courseData, setCourseData] = useState<Course>({
    title: "",
    category: "",
    image: "",
    price: 0,
    description: "",
    units: [
      {
        title: "",
        description: "",
      },
    ],
  });

  const getCategories = async () => {
    try {
      let data = await Axios.get("/category");
      console.log(data.data);
      setCategories(data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    unitIndex: number
  ) => {
    const { name, value } = e.target;

    setCourseData((prevData) => {
      const newData: Course = { ...prevData };

      if (name === "title" || name === "description") {
        newData.units[unitIndex][name] = value;
      }

      return newData;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", courseData);
  };

  useEffect(() => {
    getCategories();
  }, []);
  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Create New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Course Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={courseData.title}
            onChange={(e) => handleChange(e, 0)}
            className="mt-1 p-2 w-full border rounded-md"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select name="category" id="">
            <option className="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" hidden>
              select category
            </option>
            {categories.map((item, key) => (
              <option
                className=""
                value={item._id}
                key={key}
              >
                {item.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            id="category"
            name="category"
            value={courseData.category}
            onChange={(e) => handleChange(e, 0)}
            className="mt-1 p-2 w-full border rounded-md"
            required
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={courseData.price}
            onChange={(e) => handleChange(e, 0)}
            className="mt-1 p-2 w-full border rounded-md"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Course Description
          </label>
          <textarea
            id="description"
            name="description"
            value={courseData.description}
            onChange={(e) => handleChange(e, 0)}
            rows={3}
            className="mt-1 p-2 w-full border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateCourseForm;
