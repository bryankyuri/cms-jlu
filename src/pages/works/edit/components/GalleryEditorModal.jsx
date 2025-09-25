import React, { useEffect } from "react";
import {
  FiX,
  FiPlusCircle,
  FiMove,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { GrGallery } from "react-icons/gr";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const GalleryEditorModal = ({
  isGalleryModalOpen,
  galleryModalAnimated,
  setGalleryModalAnimated,
  tempImagesOrder,
  closeGalleryModal,
  openAddGalleryModal,
  handleDragEnd,
  renderGalleryThumbnails,
  getGalleryTypeLabel,
  editGalleryItem,
  showRemoveConfirmation,
  applyGalleryChanges,
}) => {
  // Trigger animation only once when modal opens
  useEffect(() => {
    if (isGalleryModalOpen && !galleryModalAnimated) {
      setGalleryModalAnimated(true);
    }
  }, [isGalleryModalOpen, galleryModalAnimated, setGalleryModalAnimated]);

  // Manage body scroll for gallery editor modal
  useEffect(() => {
    if (isGalleryModalOpen) {
      document.body.style.overflow = "hidden";
    }

    // Cleanup when modal closes or component unmounts
    return () => {
      if (!isGalleryModalOpen) {
        document.body.style.overflow = "";
      }
    };
  }, [isGalleryModalOpen]);

  if (!isGalleryModalOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        !galleryModalAnimated ? "animate-fadeIn" : ""
      }`}
    >
      <div
        className={`bg-white w-full h-full flex flex-col ${
          !galleryModalAnimated ? "animate-slideUpFromBottom" : ""
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium">Edit Project Gallery</h3>
          <button
            onClick={closeGalleryModal}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">
              {tempImagesOrder.length > 0 && (
                <>Drag items to reorder your project gallery.</>
              )}
            </p>
            <button
              onClick={openAddGalleryModal}
              className="bg-black text-white px-4 py-3 rounded-md flex items-center hover:bg-gray-800 transition-colors"
            >
              <FiPlusCircle className="mr-2" size={18} />
              Add Gallery Item
            </button>
          </div>
          {tempImagesOrder.length === 0 && (
            <>
              <GrGallery  className="mx-auto text-6xl text-gray-300 mb-4 mt-60" />
              <p className="text-center text-gray-500">
                No gallery items added yet.
              </p>
            </>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery-items">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  {tempImagesOrder.map((image, index) => {
                    console.log(image);
                    return (
                      <Draggable
                        key={image.id}
                        draggableId={image.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center bg-white border rounded-lg p-4 ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-4 text-gray-500 cursor-move"
                            >
                              <FiMove size={24} />
                            </div>

                            {renderGalleryThumbnails(image)}

                            <div className="ml-4 flex-grow">
                              <div className="font-medium text-lg">
                                {getGalleryTypeLabel(image.type)}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                Position {index + 1}
                              </div>
                              <button
                                onClick={() => editGalleryItem(image, index)}
                                className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => showRemoveConfirmation(index)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Remove"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            onClick={closeGalleryModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
            onClick={applyGalleryChanges}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryEditorModal;
