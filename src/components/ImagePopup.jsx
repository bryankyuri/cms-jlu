import React from "react";

const ImagePopup = ({ popupImage, popupImageIndex, closePopup, setPopupImageIndex, workData }) => {
  if (!popupImage) return null;

  const isArrayImage = Array.isArray(popupImage);
  const currentImage = isArrayImage ? popupImage[popupImageIndex] : popupImage;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={closePopup}
    >
      <div className="relative max-w-full max-h-full">
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-white text-2xl z-10 hover:opacity-70 transition-opacity"
        >
          ✕
        </button>

        {/* Navigation arrows for array images */}
        {isArrayImage && popupImage.length > 1 && (
          <>
            {popupImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupImageIndex(popupImageIndex - 1);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:opacity-70 transition-opacity z-10"
              >
                ‹
              </button>
            )}
            {popupImageIndex < popupImage.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupImageIndex(popupImageIndex + 1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:opacity-70 transition-opacity z-10"
              >
                ›
              </button>
            )}
          </>
        )}

        {/* Image counter for array images */}
        {isArrayImage && popupImage.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {popupImageIndex + 1} / {popupImage.length}
          </div>
        )}

        {/* Main image */}
        <img
          src={currentImage}
          alt={workData.title}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImagePopup;
