/**
 * Image optimization utility for compressing and resizing images before upload
 * Reduces file sizes while maintaining acceptable quality
 * Supports all common image formats and automatically generates optimized versions
 */

/**
 * Configuration for different image optimization levels
 */
const OPTIMIZATION_PRESETS = {
  high: {
    maxWidth: 2560,
    maxHeight: 1440,
    quality: 0.92,
    format: 'image/jpeg'
  },
  medium: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'image/jpeg'
  },
  low: {
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.75,
    format: 'image/jpeg'
  },
  thumbnail: {
    maxWidth: 400,
    maxHeight: 300,
    quality: 0.8,
    format: 'image/jpeg'
  }
};

/**
 * Optimize an image file by compressing and resizing
 * @param {File} imageFile - The image file to optimize
 * @param {Object} options - Optimization options
 * @param {string} options.preset - Preset level: 'high', 'medium', 'low', 'thumbnail'
 * @param {number} options.maxWidth - Maximum width (overrides preset)
 * @param {number} options.maxHeight - Maximum height (overrides preset)
 * @param {number} options.quality - JPEG quality 0-1 (overrides preset)
 * @param {string} options.format - Output format (overrides preset)
 * @param {boolean} options.maintainAspectRatio - Whether to maintain aspect ratio (default: true)
 * @returns {Promise<{file: File, originalSize: number, optimizedSize: number, compressionRatio: number}>}
 */
export const optimizeImage = (imageFile, options = {}) => {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      reject(new Error('Invalid image file provided'));
      return;
    }

    // Get preset configuration
    const preset = OPTIMIZATION_PRESETS[options.preset] || OPTIMIZATION_PRESETS.medium;
    
    // Merge options with preset defaults
    const config = {
      maxWidth: options.maxWidth || preset.maxWidth,
      maxHeight: options.maxHeight || preset.maxHeight,
      quality: options.quality !== undefined ? options.quality : preset.quality,
      format: options.format || preset.format,
      maintainAspectRatio: options.maintainAspectRatio !== false
    };

    // Special handling for SVG files - don't compress them
    if (imageFile.type === 'image/svg+xml') {
      resolve({
        file: imageFile,
        originalSize: imageFile.size,
        optimizedSize: imageFile.size,
        compressionRatio: 1
      });
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      try {
        const originalSize = imageFile.size;
        
        // Calculate new dimensions
        let { width, height } = calculateOptimalDimensions(
          img.width,
          img.height,
          config.maxWidth,
          config.maxHeight,
          config.maintainAspectRatio
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the image onto the canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          // Generate optimized filename
          const originalName = imageFile.name;
          const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
          const ext = config.format === 'image/jpeg' ? '.jpg' : 
                     config.format === 'image/png' ? '.png' : 
                     config.format === 'image/webp' ? '.webp' : '.jpg';
          
          const optimizedFile = new File([blob], `${nameWithoutExt}${ext}`, {
            type: config.format,
            lastModified: Date.now()
          });

          const optimizedSize = optimizedFile.size;
          const compressionRatio = originalSize / optimizedSize;

          // Clean up
          URL.revokeObjectURL(img.src);

          resolve({
            file: optimizedFile,
            originalSize,
            optimizedSize,
            compressionRatio,
            dimensions: { width, height },
            originalDimensions: { width: img.width, height: img.height }
          });
        }, config.format, config.quality);

      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @param {boolean} maintainAspectRatio - Whether to maintain aspect ratio
 * @returns {Object} - {width, height}
 */
const calculateOptimalDimensions = (originalWidth, originalHeight, maxWidth, maxHeight, maintainAspectRatio = true) => {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight)
    };
  }

  // If image is already smaller than max dimensions, keep original size
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight
    };
  }

  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;

  let width, height;

  // Determine which dimension is the limiting factor
  if (originalWidth / maxWidth > originalHeight / maxHeight) {
    // Width is the limiting factor
    width = maxWidth;
    height = Math.round(maxWidth / aspectRatio);
  } else {
    // Height is the limiting factor
    height = maxHeight;
    width = Math.round(maxHeight * aspectRatio);
  }

  return { width, height };
};

/**
 * Optimize multiple images in batch
 * @param {File[]} imageFiles - Array of image files
 * @param {Object} options - Optimization options
 * @param {Function} progressCallback - Progress callback function
 * @returns {Promise<Array>} - Array of optimization results
 */
export const optimizeMultipleImages = async (imageFiles, options = {}, progressCallback = null) => {
  const results = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    
    if (progressCallback) {
      progressCallback({
        current: i + 1,
        total: imageFiles.length,
        fileName: file.name
      });
    }

    try {
      const result = await optimizeImage(file, options);
      results.push({
        success: true,
        ...result
      });
    } catch (error) {
      console.error(`Failed to optimize ${file.name}:`, error);
      results.push({
        success: false,
        file,
        error: error.message,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1
      });
    }
  }

  return results;
};

/**
 * Get image information without optimization
 * @param {File} imageFile - The image file
 * @returns {Promise<Object>} - Image metadata
 */
export const getImageMetadata = (imageFile) => {
  return new Promise((resolve, reject) => {
    if (!imageFile.type.startsWith('image/')) {
      reject(new Error('Not a valid image file'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      const metadata = {
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        size: imageFile.size,
        type: imageFile.type,
        name: imageFile.name
      };
      
      URL.revokeObjectURL(img.src);
      resolve(metadata);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image metadata'));
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Format file size for human readable display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculate compression statistics
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 * @returns {Object} - Compression statistics
 */
export const getCompressionStats = (originalSize, compressedSize) => {
  const ratio = originalSize / compressedSize;
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(1);
  
  return {
    ratio: parseFloat(ratio.toFixed(2)),
    savedBytes,
    savedPercentage: parseFloat(savedPercentage),
    originalSize: formatFileSize(originalSize),
    compressedSize: formatFileSize(compressedSize),
    savedSize: formatFileSize(savedBytes)
  };
};