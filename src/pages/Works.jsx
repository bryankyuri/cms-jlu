import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiEye, FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../context/AppContext"; // Make sure this import exists

const Works = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const { deviceType } = useContext(AppContext);

  // Sample works data
  const [works, setWorks] = useState([
    {
      id: 1,
      name: "PILLOW WALK",
      client: "ALDO",
      projectYear: "2023",
      thumbnail: "/assets/works/work1.jpg",
      categories: ["COLOR GRADING", "MOTION GRAPHIC"],
      status: "published",
      dateModified: "2023-05-15",
    },
    {
      id: 2,
      name: "RAMADAN 2024",
      client: "TOKOPEDIA",
      projectYear: "2024",
      thumbnail: "/assets/works/work2.jpg",
      categories: ["MOTION GRAPHIC"],
      status: "published",
      dateModified: "2024-01-12",
    },
    {
      id: 3,
      name: "TRUST IN GOLD",
      client: "UBS GOLD",
      projectYear: "2023",
      thumbnail: "/assets/works/work3.jpg",
      categories: ["COLOR GRADING", "CGI"],
      status: "draft",
      dateModified: "2023-07-22",
    },
    {
      id: 4,
      name: "SPEAK TO ME",
      client: "SOCIOLLA",
      projectYear: "2023",
      thumbnail: "/assets/works/work4.jpg",
      categories: ["MOTION GRAPHIC", "CGI"],
      status: "published",
      dateModified: "2023-09-05",
    },
    {
      id: 5,
      name: "AUTUMN COLLECTION",
      client: "UNIQLO",
      projectYear: "2024",
      thumbnail: "/assets/works/work5.jpg",
      categories: ["COLOR GRADING"],
      status: "unpublished",
      dateModified: "2024-02-28",
    },
    {
      id: 6,
      name: "NEXT LEVEL CAMPAIGN",
      client: "ADIDAS",
      projectYear: "2023",
      thumbnail: "/assets/works/work6.jpg",
      categories: ["MOTION GRAPHIC", "CGI"],
      status: "published",
      dateModified: "2023-11-14",
    },
  ]);

  // Function to handle search and sort
  const getFilteredWorks = () => {
    return [...works]
      .filter((work) =>
        work.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.client.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let valueA, valueB;

        if (sortBy === "name") {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        } else if (sortBy === "client") {
          valueA = a.client.toLowerCase();
          valueB = b.client.toLowerCase();
        } else if (sortBy === "dateModified") {
          valueA = new Date(a.dateModified);
          valueB = new Date(b.dateModified);
        }

        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
  };

  // Handlers
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleViewDetail = (workId) => {
    navigate(`/works/${workId}`);
  };

  const handleStatusChange = (workId, newStatus) => {
    setWorks(
      works.map((work) => {
        if (work.id === workId) {
          return {
            ...work,
            status: newStatus,
            dateModified: new Date().toISOString().split("T")[0],
          };
        }
        return work;
      })
    );

    toast.success(`Work status changed to ${newStatus}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "unpublished":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categories = ["ALL PROJECT", "COLOR GRADING", "MOTION GRAPHIC", "CGI"];

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <h1 className="lg:text-[40px] text-[36px] text-black font-bold lg:mb-[60px] text-center">
        WORKS
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
          {/* Search input */}
          <div className="relative flex w-full sm:w-auto min-w-[300px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <FiSearch className="text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Search by work name or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border-b border-gray-300 focus:outline-none focus:border-black"
            />
          </div>

          {/* Sort options */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full sm:w-auto min-w-[150px] border-b border-gray-300 px-2 py-2 focus:outline-none focus:border-black"
            >
              <option value="name">Sort by Name</option>
              <option value="client">Sort by Client</option>
              <option value="dateModified">Sort by Modified Date</option>
            </select>

            <button
              onClick={handleSortDirectionToggle}
              className="px-2 py-2 border border-gray-300 rounded-md h-full w-[40px] text-center"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* Add Work Button */}
        <Link
          to="/works/create"
          className="w-full sm:w-auto bg-[#F0F0F0] text-[#787878] px-6 py-2 rounded text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-center font-semibold"
        >
          <FiPlus className="mr-2" />
          ADD WORK
        </Link>
      </div>

      {/* Works List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                >
                  Preview
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Work
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Year
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Categories
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredWorks().length > 0 ? (
                getFilteredWorks().map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 overflow-hidden rounded">
                        <img
                          src={work.thumbnail}
                          alt={`${work.name} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        {work.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{work.client}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {work.projectYear}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {work.categories.map((category, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          work.status
                        )}`}
                      >
                        {work.status.charAt(0).toUpperCase() + work.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-start space-x-3">
                        <button
                          onClick={() => handleViewDetail(work.id)}
                          className="flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition-colors"
                        >
                          <FiEye size={16} className="mr-1" />
                          <span>View</span>
                        </button>

                        {work.status === "published" ? (
                          <button
                            onClick={() => handleStatusChange(work.id, "unpublished")}
                            className="flex items-center px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <FiX size={16} className="mr-1" />
                            <span>Unpublish</span>
                          </button>
                        ) : work.status === "unpublished" || work.status === "draft" ? (
                          <button
                            onClick={() => handleStatusChange(work.id, "published")}
                            className="flex items-center px-3 py-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Publish</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No works found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Works;
