import {
	ReactCompareSlider,
	ReactCompareSliderImage,
} from "react-compare-slider";

// Helper function to get image thumbnail
const getImageThumbnail = (image) => {
  if (image.type === "full-width") {
    return image.imageUrl;
  } else if (image.type === "2col-full") {
    return Array.isArray(image.imageUrl) ? image.imageUrl[0] : image.imageUrl;
  } else if (image.type === "compare-full") {
    return Array.isArray(image.imageUrl) ? image.imageUrl[0] : image.imageUrl;
  }
  return Array.isArray(image.imageUrl) ? image.imageUrl[0] : image.imageUrl;
};

// Helper function to get gallery type label
const getGalleryTypeLabel = (type) => {
  switch (type) {
    case "full-width":
      return "Full Width Image";
    case "2col-full":
      return "Two Column Layout";
    case "compare-full":
      return "Before/After Comparison";
    case "2col-4:5":
      return "Two Column 4:5 Layout";
    default:
      return type;
  }
};

// Render utility functions
export const renderUtils = {
	// Function to render images based on their type
	renderImage: (type, imageUrl, workData, handleImageClick, sliderPosition, isAnimating, animateSlider) => {
		switch (type) {
			case "full-width":
				return (
					<div className="w-full">
						<img
							src={imageUrl}
							alt={workData.title}
							className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
							onClick={() => handleImageClick(imageUrl)}
						/>
					</div>
				);
			case "2col-full":
				return (
					<div className="grid grid-cols-2 lg:gap-5 gap-[10px]">
						{imageUrl.map((url, index) => (
							<img
								key={index}
								src={url}
								alt={workData.title}
								className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
								onClick={() => handleImageClick(imageUrl, index)}
							/>
						))}
					</div>
				);
			case "compare-full":
				return (
					<div className="w-full relative">
						{/* Create a proper sticky container with background */}
						<div className="sticky top-[62px] z-20 w-full bg-opacity-10 pt-4 px-4">
							<div className="flex justify-between items-center">
								{sliderPosition !== 0 && (
									<button
										onClick={() => !isAnimating && animateSlider(100)}
										className="bg-black bg-opacity-70 text-white lg:px-3 px-2 py-1 lg:text-sm text-xs font-medium rounded transition-opacity duration-300"
										disabled={isAnimating}
									>
										BEFORE
									</button>
								)}
								{sliderPosition !== 100 && (
									<button
										onClick={() => !isAnimating && animateSlider(0)}
										className="bg-black bg-opacity-70 text-white lg:px-3 px-2 py-1 lg:text-sm text-xs font-medium rounded transition-opacity duration-300"
										disabled={isAnimating}
									>
										AFTER
									</button>
								)}
							</div>
						</div>

						<div className="relative h-auto">
							<ReactCompareSlider
								itemOne={
									<ReactCompareSliderImage
										src={imageUrl[0]}
										alt={workData.title}
										style={{
											objectFit: "cover",
											cursor: "pointer",
										}}
										onClick={() => handleImageClick(imageUrl, 0)}
									/>
								}
								itemTwo={
									<ReactCompareSliderImage
										src={imageUrl[1]}
										alt={workData.title}
										style={{
											objectFit: "cover",
											cursor: "pointer",
										}}
										onClick={() => handleImageClick(imageUrl, 1)}
									/>
								}
								position={sliderPosition}
								className="w-full"
								boundsPadding={0}
							/>
						</div>
					</div>
				);
			case "2col-4:5":
				return (
					<div className="grid grid-cols-2 lg:gap-5 gap-[10px]" style={{ aspectRatio: "8/5" }}>
						{imageUrl.map((url, index) => (
							<img
								key={index}
								src={url}
								alt={workData.title}
								className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
								onClick={() => handleImageClick(imageUrl, index)}
							/>
						))}
					</div>
				);
			default:
				return null;
		}
	},

  // Function to render thumbnails for gallery items in editor
  renderGalleryThumbnails: (image) => {
    if (image.type === "full-width") {
      // Single thumbnail for full-width
      return (
        <div className="w-24 h-12 overflow-hidden rounded-lg flex-shrink-0">
          <img
            src={getImageThumbnail(image)}
            alt="Gallery item"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // Multiple thumbnails for other types
      const imageUrls = Array.isArray(image.imageUrl) ? image.imageUrl : [image.imageUrl];
      return (
        <div className="flex gap-2 flex-shrink-0">
          {imageUrls.slice(0, 2).map((url, index) => (
            <div key={index} className="w-12 h-12 overflow-hidden rounded-lg">
              <img
                src={url}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {imageUrls.length > 2 && (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                +{imageUrls.length - 2}
              </span>
            </div>
          )}
        </div>
      );
    }
  },

  // Get image thumbnail URL
  getImageThumbnail,

  // Get gallery type label  
  getGalleryTypeLabel,
};

// Export helper functions individually as well
export { getImageThumbnail, getGalleryTypeLabel };