import React, { useState, useEffect } from "react";
import { FiVideo, FiPlay } from "react-icons/fi";
import { mediaAPI } from "../../../api";

const VideoThumbnail = ({ file, size = "large" }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useDirectVideo, setUseDirectVideo] = useState(false);

  useEffect(() => {
    if (file.mime_type.includes("video")) {
      const generateThumbnail = async () => {
        try {
          const video = document.createElement("video");
          video.muted = true;
          video.preload = "metadata";
          // Don't set crossOrigin to avoid CORS issues

          const loadVideo = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Video loading timeout"));
            }, 8000);

            video.onloadedmetadata = () => {
              // Only try to seek if we have duration
              if (video.duration && video.duration > 0) {
                const seekTime = Math.min(2, video.duration * 0.1);
                video.currentTime = seekTime;
              } else {
                // If no duration, try to draw the first frame
                setTimeout(() => {
                  video.onseeked();
                }, 100);
              }
            };

            video.onseeked = () => {
              try {
                clearTimeout(timeout);
                // Check if video has valid dimensions
                if (video.videoWidth === 0 || video.videoHeight === 0) {
                  reject(new Error("Video has no valid dimensions"));
                  return;
                }

                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0);

                const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
                resolve(thumbnailUrl);
              } catch (err) {
                clearTimeout(timeout);
                reject(err);
              }
            };

            video.onerror = (e) => {
              clearTimeout(timeout);
              reject(
                new Error(
                  `Video failed to load: ${e.message || "Unknown error"}`
                )
              );
            };
          });

          video.src = mediaAPI.getDirectUrl(file.path);

          const thumbnailUrl = await loadVideo;
          setThumbnail(thumbnailUrl);
          setIsLoading(false);
        } catch (err) {
          console.error(
            "Error generating video thumbnail, falling back to direct video:",
            err
          );
          // Fallback to showing the video element directly
          setUseDirectVideo(true);
          setIsLoading(false);
        }
      };

      generateThumbnail();
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [file]);

  const isSmall = size === "small";

  if (error || !file.mime_type.includes("video")) {
    return isSmall ? (
      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
        <FiVideo size={12} className="text-gray-400" />
      </div>
    ) : (
      <div className="relative group cursor-pointer">
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
          <FiVideo size={32} className="text-gray-400" />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <FiPlay size={16} className="text-gray-700 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
          Video
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`bg-gray-100 rounded flex items-center justify-center ${
          isSmall ? "w-6 h-6" : "w-full aspect-square rounded"
        }`}
      >
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-500 ${
            isSmall ? "h-3 w-3" : "h-6 w-6"
          }`}
        ></div>
      </div>
    );
  }

  // If we have a generated thumbnail, show it
  if (thumbnail) {
    return (
      <div
        className={`relative group cursor-pointer ${
          isSmall ? "w-6 h-6" : ""
        }`}
      >
        <img
          src={thumbnail}
          alt={file.original_name}
          className={`object-cover ${
            isSmall ? "w-6 h-6 rounded" : "w-full aspect-square rounded"
          }`}
        />
        {!isSmall && (
          <>
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <FiPlay size={20} className="text-gray-700 ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              Video
            </div>
          </>
        )}
      </div>
    );
  }

  // Fallback: show video element directly
  if (useDirectVideo && !isSmall) {
    return (
      <div className="relative group cursor-pointer">
        <video
          src={mediaAPI.getDirectUrl(file.path)}
          className="w-full aspect-square object-cover rounded"
          muted
          preload="metadata"
          onError={() => setError(true)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white bg-opacity-90 rounded-full p-3">
            <FiPlay size={20} className="text-gray-700 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          Video
        </div>
      </div>
    );
  }

  // Final fallback
  return isSmall ? (
    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
      <FiVideo size={12} className="text-gray-400" />
    </div>
  ) : (
    <div className="relative group cursor-pointer">
      <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
        <FiVideo size={32} className="text-gray-400" />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white bg-opacity-90 rounded-full p-2">
          <FiPlay size={16} className="text-gray-700 ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
        Video
      </div>
    </div>
  );
};

export default VideoThumbnail;