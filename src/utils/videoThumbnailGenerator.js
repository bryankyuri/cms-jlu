/**
 * Generate Full HD video thumbnail on the frontend using HTML5 Canvas
 * This works in all browsers and doesn't require server-side processing
 * Generates thumbnails at Full HD resolution (1920x1080) while maintaining aspect ratio
 */

/**
 * Generate Full HD video thumbnail at specified time
 * @param {File} videoFile - The video file
 * @param {number} timeInSeconds - Time to capture frame (default: 2 seconds)
 * @returns {Promise<Blob>} - Promise resolving to Full HD thumbnail blob
 */
export const generateVideoThumbnail = (videoFile, timeInSeconds = 2) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set video properties
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadedmetadata', () => {
      // Set canvas dimensions for Full HD (1920x1080)
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      // Use Full HD dimensions
      canvas.width = 1920;
      canvas.height = 1080;
      
      // If video aspect ratio doesn't match 16:9, maintain aspect ratio within Full HD bounds
      if (aspectRatio > (1920/1080)) {
        // Video is wider - fit to width
        canvas.height = Math.round(1920 / aspectRatio);
      } else if (aspectRatio < (1920/1080)) {
        // Video is taller - fit to height  
        canvas.width = Math.round(1080 * aspectRatio);
      }
      
      // Set video time to capture frame
      const captureTime = Math.min(timeInSeconds, video.duration);
      video.currentTime = captureTime;
    });
    
    video.addEventListener('seeked', () => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob with high quality for Full HD
        canvas.toBlob((blob) => {
          // Clean up
          URL.revokeObjectURL(video.src);
          
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.9); // Increased quality from 0.8 to 0.9 for Full HD
      } catch (error) {
        URL.revokeObjectURL(video.src);
        reject(error);
      }
    });
    
    video.addEventListener('error', (e) => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    });
    
    // Load video file
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Generate multiple thumbnails at different time points
 * @param {File} videoFile - The video file
 * @param {number[]} timePoints - Array of time points in seconds
 * @returns {Promise<Array>} - Promise resolving to array of thumbnail objects
 */
export const generateMultipleVideoThumbnails = async (videoFile, timePoints = [1, 3, 5]) => {
  const thumbnails = [];
  
  for (const timePoint of timePoints) {
    try {
      const thumbnail = await generateVideoThumbnail(videoFile, timePoint);
      thumbnails.push({
        time: timePoint,
        blob: thumbnail,
        url: URL.createObjectURL(thumbnail)
      });
    } catch (error) {
      console.warn(`Failed to generate thumbnail at ${timePoint}s:`, error);
    }
  }
  
  return thumbnails;
};

/**
 * Get video duration and metadata without loading the full video
 * @param {File} videoFile - The video file
 * @returns {Promise<Object>} - Promise resolving to video metadata
 */
export const getVideoMetadata = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadedmetadata', () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight
      };
      
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    });
    
    video.addEventListener('error', () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    });
    
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Convert blob to file
 * @param {Blob} blob - The blob to convert
 * @param {string} filename - The filename
 * @returns {File} - The converted file
 */
export const blobToFile = (blob, filename) => {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now()
  });
};