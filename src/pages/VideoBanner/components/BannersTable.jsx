import React from "react";
import { FiEdit, FiX, FiVideo, FiPlus } from "react-icons/fi";

const BannersTable = ({
  banners,
  onEditBanner,
  onDeleteBanner,
  onCreateModal,
}) => {
  if (banners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FiVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No video banners yet
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first video banner by selecting from published works.
        </p>
        <button
          onClick={onCreateModal}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Create First Banner
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                Categories
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Video Source
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
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-16 w-28 relative">
                    <img
                      className="h-16 w-28 object-cover rounded"
                      src={banner.video_thumbnail}
                      alt={banner.work_title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-1">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {banner.work_title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {banner.work_client}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {banner.work_categories &&
                      banner.work_categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {category}
                        </span>
                      ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      banner.video_source_type === "custom"
                        ? "bg-blue-100 text-blue-800"
                        : banner.video_source_type === "cloudflare"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {banner.video_source_type === "custom"
                      ? "Custom Video"
                      : banner.video_source_type === "cloudflare"
                      ? "Cloudflare Video"
                      : "Work Default"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEditBanner(banner)}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FiEdit className="inline mr-1" />
                    Edit
                  </button>
                  {/* <button
                    onClick={() => onDeleteBanner(banner.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    <FiX className="inline mr-1" />
                    Delete
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannersTable;
