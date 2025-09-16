import React from "react";
import {
  FiTrash2,
  FiEdit,
  FiDownload,
  FiVideo,
} from "react-icons/fi";
import VideoThumbnail from "./VideoThumbnail";
import { mediaAPI } from "../../../api";

const MediaGrid = ({
  mediaFiles,
  viewMode,
  handleMediaClick,
  handleDeleteFile,
  getFileIcon,
  formatFileSize,
}) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📁</div>
        <p className="text-gray-500 text-lg">No media files found</p>
        <p className="text-gray-400 text-sm">
          Upload some files to get started
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {mediaFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div
              className="aspect-square bg-gray-50 relative cursor-pointer"
              onClick={() => handleMediaClick(file)}
            >
              {file.is_image ? (
                <img
                  src={mediaAPI.getDirectUrl(file.path)}
                  alt={file.alt_text || file.original_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : file.mime_type.includes("video") ? (
                <VideoThumbnail file={file} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-4xl text-gray-400">
                    {getFileIcon(file.mime_type)}
                  </div>
                </div>
              )}
              <div
                className="absolute inset-0 flex items-center justify-center bg-gray-100"
                style={{ display: "none" }}
              >
                <div className="text-4xl text-gray-400">
                  {getFileIcon(file.mime_type)}
                </div>
              </div>
              {/* Action buttons - visible on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement("a");
                    link.href = mediaAPI.getDirectUrl(file.path);
                    link.download = file.original_name;
                    link.click();
                  }}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-1.5 rounded shadow-sm"
                  title="Download"
                >
                  <FiDownload size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id, file.original_name);
                  }}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-600 p-1.5 rounded shadow-sm"
                  title="Delete"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={file.original_name}
              >
                {file.original_name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
                <span className="text-xs text-gray-400">
                  {file.extension?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>

      {/* File list */}
      <div className="divide-y divide-gray-200">
        {mediaFiles.map((file) => (
          <div
            key={file.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={() => handleMediaClick(file)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {file.is_image ? (
                    <img
                      src={mediaAPI.getDirectUrl(file.path)}
                      alt={file.alt_text || file.original_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : file.mime_type.includes("video") ? (
                    <VideoThumbnail file={file} size="small" />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(file.mime_type)}
                    </div>
                  )}
                  <div
                    className="w-full h-full flex items-center justify-center text-gray-400"
                    style={{ display: "none" }}
                  >
                    {getFileIcon(file.mime_type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium text-gray-900 truncate"
                    title={file.original_name}
                  >
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {file.alt_text || "No description"}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {file.extension?.toUpperCase()}
                </span>
              </div>
              <div className="col-span-2 text-sm text-gray-900">
                {formatFileSize(file.size)}
              </div>
              <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement("a");
                      link.href = mediaAPI.getDirectUrl(file.path);
                      link.download = file.original_name;
                      link.click();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Download"
                  >
                    <FiDownload size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id, file.original_name);
                    }}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGrid;