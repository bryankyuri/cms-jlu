import React, { useContext } from "react";
import ImagePopup from "../../../components/ImagePopup.jsx";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../../styles/WorkDetail.module.scss";
import { AppContext } from "../../../context/AppContext.jsx";
import { FadeInSection } from "../../../components/FadeInSection.jsx";
import {
  FiEdit,
  FiSave,
  FiX,
  FiPlusCircle,
  FiTrash2,
  FiImage,
  FiUpload,
  FiMove,
  FiPlus,
  FiInfo,
} from "react-icons/fi";
import { FaLightbulb } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Import modal components
import GalleryEditorModal from "./components/GalleryEditorModal.jsx";
import RemoveConfirmationModal from "./components/RemoveConfirmationModal.jsx";
import CreditRemoveConfirmationModal from "./components/CreditRemoveConfirmationModal.jsx";
import AddGalleryItemModal from "./components/AddGalleryItemModal.jsx";
import HeroBannerEditorModal from "./components/HeroBannerEditorModal.jsx";
import VideoProjectEditorModal from "./components/VideoProjectEditorModal.jsx";

// Import hooks and utils
import { useWorkCreate } from "./hooks/useWorkCreate.js";
import { useWorkCreateHandlers } from "./hooks/useWorkCreateHandlers.js";
import { useMediaHandlers } from "./hooks/useMediaHandlers.js";
import { useGalleryHandlers } from "./hooks/useGalleryHandlers.js";
import { useModalHandlers } from "./hooks/useModalHandlers.js";
import { renderUtils } from "../../../utils/renderUtils.jsx";

const WorkCreate = () => {
  const { deviceType } = useContext(AppContext);
  const navigate = useNavigate();

  // Available tag options (predefined)
  const AVAILABLE_TAGS = ["MOTION GRAPHIC", "COLOR GRADING", "VFX", "CGI"];

  // Available image types for gallery
  const IMAGE_TYPES = [
    { value: "full-width", label: "Full Width Image", imageCount: 1 },
    { value: "2col-full", label: "Two Column Layout", imageCount: 2 },
    { value: "2col-4:5", label: "Two Column 4:5 Layout", imageCount: 2 },
    { value: "compare-full", label: "Before/After Comparison", imageCount: 2 },
  ];

  // Use custom hooks
  const workCreateState = useWorkCreate();

  // Destructure commonly used values for easier access
  const {
    workData,
    sliderPosition,
    setSliderPosition,
    isAnimating,
    animationRef,
    popupImage,
    popupImageIndex,
    setPopupImageIndex,
    isGalleryModalOpen,
    setIsGalleryModalOpen,
    galleryModalAnimated,
    setGalleryModalAnimated,
    tempImagesOrder,
    setTempImagesOrder,
    isAddGalleryModalOpen,
    availableImages,
    loadingImages,
    selectedImageType,
    selectedImages,
    editingGalleryItem,
    isRemoveConfirmOpen,
    removeItemIndex,
    isCreditRemoveConfirmOpen,
    removeCreditIndex,
    isHeroBannerModalOpen,
    selectedHeroBannerImage,
    setSelectedHeroBannerImage,
    isVideoProjectModalOpen,
    selectedVideoProject,
    setSelectedVideoProject,
    availableVideos,
    loadingVideos,
    isUploading,
    uploadProgress,
    isSaving,
    heroBannerButtonBg,
    isHeroBannerVisible,
    // Functions
    animateSlider,
    handleImageClick,
    closePopup,
  } = workCreateState;

  const workCreateHandlers = useWorkCreateHandlers(
    workData,
    workCreateState.setWorkData,
    setTempImagesOrder,
    tempImagesOrder,
    isSaving,
    workCreateState.setIsSaving,
    navigate
  );

  const mediaHandlers = useMediaHandlers(
    workCreateState.setIsUploading,
    workCreateState.setUploadProgress,
    workCreateState.fetchAvailableImages,
    workCreateState.fetchAvailableVideos
  );

  const galleryHandlers = useGalleryHandlers(
    IMAGE_TYPES,
    workData,
    workCreateState.setWorkData,
    tempImagesOrder,
    setTempImagesOrder,
    selectedImages,
    workCreateState.setSelectedImages,
    selectedImageType,
    workCreateState.setSelectedImageType,
    setIsGalleryModalOpen,
    workCreateState.setGalleryModalAnimated,
    workCreateState.setIsAddGalleryModalOpen,
    workCreateState.setEditingGalleryItem,
    workCreateState.setIsRemoveConfirmOpen,
    workCreateState.setRemoveItemIndex,
    workCreateState.fetchAvailableImages,
    workCreateState.setIsImageUploadModalOpen
  );

  const modalHandlers = useModalHandlers(
    workData,
    workCreateState.setWorkData,
    workCreateState.setIsCreditRemoveConfirmOpen,
    workCreateState.setRemoveCreditIndex,
    workCreateState.setIsHeroBannerModalOpen,
    selectedHeroBannerImage,
    workCreateState.setSelectedHeroBannerImage,
    workCreateState.setIsVideoProjectModalOpen,
    selectedVideoProject,
    workCreateState.setSelectedVideoProject,
    workCreateState.fetchAvailableImages,
    workCreateState.fetchAvailableVideos,
    workCreateState.setIsImageUploadModalOpen,
    workCreateState.setIsVideoUploadModalOpen
  );

  return (
    <div className={styles.workDetail}>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Add validation highlight styles */}
      <style>{`
        .validation-highlight {
          animation: highlight 1s ease-in-out 3;
          box-shadow: 0 0 0px rgba(239, 68, 68, 0.5) !important;
        }
        
        @keyframes highlight {
          0%, 100% { 
            background-color: transparent;
            transform: scale(1);
          }
          50% { 
            background-color: rgba(239, 68, 68, 0.3);
            transform: scale(1);
          }
        }
      `}</style>

      <div className="w-full mx-auto">
        <div
          className={`hero-banner-section w-full bg-black text-white relative ${styles.heroBanner} lg:mb-5 mb-[10px]`}
          style={{
            height:
              deviceType === "desktop"
                ? "calc(100vh - 62px)"
                : "calc(100vh - 66px)",
            backgroundImage: `url(${workData.heroBannerImage})`,
            backgroundSize:
              deviceType === "desktop" ? "100% auto" : "auto 100%",
            backgroundPosition:
              deviceType === "desktop" ? `center 0px` : "center 0px",
            backgroundRepeat: "no-repeat",
          }}
        >
          {!workData.heroBannerImage && (
            <button
              id="hero-banner-button"
              onClick={modalHandlers.openHeroBannerModal}
              className="absolute inset-0 flex items-center justify-center text-white"
            >
              No Hero Banner Image
            </button>
          )}
        </div>

        {/* Sticky Hero Banner Edit Button */}
        {isHeroBannerVisible && (
          <button
            onClick={modalHandlers.openHeroBannerModal}
            className={`fixed ${heroBannerButtonBg} px-4 py-3 rounded-lg flex items-center hover:opacity-90 transition-all shadow-lg backdrop-blur-sm z-50`}
            style={{
              top: deviceType === "desktop" ? "120px" : "90px", // 62px nav + 24px padding for desktop, 66px nav + 24px padding for mobile
              right: "20px",
            }}
          >
            <FiEdit className="mr-2" size={16} />
            {workData.heroBannerImage ? (
              "Edit Hero Banner"
            ) : (
              <>
                Add Hero Banner <span className="text-red-700 ml-1"> *</span>
              </>
            )}
          </button>
        )}

        {/* Tags Section */}
        <div id="tags-section" className="w-full px-5 py-2">
          <div className="flex gap-2 flex-wrap">
            <div className="font-semibold text-white bg-black px-2 py-1 rounded-[4px]">
              #
            </div>
            <>
              {AVAILABLE_TAGS.map((tag, index) => (
                <button
                  key={index}
                  onClick={() =>
                    workCreateHandlers.handleTagToggle(
                      tag,
                      !workData.tag.includes(tag)
                    )
                  }
                  className={`font-semibold px-2 py-1 rounded-[4px] transition-colors ${
                    workData.tag.includes(tag)
                      ? "text-white bg-black"
                      : "text-black bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
              <div className=" bg-blue-200 flex items-center ml-2 px-2 py-1 rounded-md text-black">
                <FiInfo className="mr-1 text-blue-700" />
                Click tag to select or unselect{" "}
                <span className="text-red-700 ml-1"> *</span>
              </div>
            </>
          </div>
        </div>

        <div className="w-full lg:text-[20px] text-[14px] text-black mx-auto px-5 flex my-[20px] lg:justify-end lg:flex-row flex-col-reverse border-b">
          <div className="w-full border-t lg:border-t-0 border-b border-black">
            <FadeInSection delay={0.3}>
              <div
                id="client-field"
                className="w-full flex border-b border-black py-2 lg:py-5"
              >
                <div className="w-[78px] lg:mr-[60px] mr-[24px] flex">
                  CLIENT <span className="text-red-700 ml-1"> *</span>
                </div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  <input
                    type="text"
                    value={workData.client}
                    placeholder="Client name"
                    onChange={(e) =>
                      workCreateHandlers.handleFieldChange(
                        "client",
                        e.target.value
                      )
                    }
                    className="w-full p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                  />
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div
                id="title-field"
                className="w-full flex border-b border-black py-2 lg:py-5"
              >
                <div className="w-[78px] lg:mr-[60px] mr-[24px] flex">
                  TITLE <span className="text-red-700 ml-1"> *</span>
                </div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  <input
                    type="text"
                    value={workData.title}
                    placeholder="Project title"
                    onChange={(e) =>
                      workCreateHandlers.handleFieldChange(
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                  />
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[78px] lg:mr-[60px] mr-[24px] flex">
                  CATEGORY <span className="text-red-700 ml-1"> *</span>
                </div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium capitalize">
                  <select
                    value={workData.category}
                    onChange={(e) =>
                      workCreateHandlers.handleFieldChange(
                        "category",
                        e.target.value
                      )
                    }
                    className="w-full p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                  >
                    <option value="film/series">film/series</option>
                    <option value="commercial">commercial</option>
                  </select>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div
                id="description-field"
                className="w-full flex border-b border-black py-2 lg:py-5"
              >
                <div className="w-[78px] lg:mr-[60px] mr-[24px]">DESC.</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] text-justify font-medium">
                  <textarea
                    value={workData.description}
                    onChange={(e) =>
                      workCreateHandlers.handleFieldChange(
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full p-1 focus:outline-none bg-gray-50 border rounded-md border-black min-h-[100px] resize-vertical"
                    placeholder="Project description..."
                  />
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div id="credits-section" className="w-full flex pt-2 lg:pt-5">
                <div className="w-[78px] lg:mr-[60px] mr-[24px] flex">
                  CREDITS <span className="text-red-700 ml-1"> *</span>
                </div>
                <div className="w-full font-medium">
                  <DragDropContext
                    onDragEnd={workCreateHandlers.handleCreditsDragEnd}
                  >
                    <Droppable droppableId="credits">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {workData.credits.map((creditsItem, index) => (
                            <Draggable
                              key={`credit-${index}`}
                              draggableId={`credit-${index}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`w-full ${
                                    workData.credits.length - 1 !== index
                                      ? "pb-2 border-b border-black lg:pb-5 mb-2 lg:mb-5"
                                      : "pb-2 border-b border-black lg:pb-5"
                                  } ${
                                    snapshot.isDragging
                                      ? "opacity-75 bg-gray-50 border rounded-md border-black p-2"
                                      : ""
                                  }`}
                                >
                                  <div className="lg:w-[calc(50%-60px)] w-[calc(100%-76px)] grid grid-cols-2 gap-x-12">
                                    <div className="w-full flex items-start gap-4">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-center p-1 mt-1 text-white bg-black rounded-full cursor-grab active:cursor-grabbing"
                                      >
                                        <FiMove size={24} />
                                      </div>
                                      <input
                                        type="text"
                                        value={creditsItem.role}
                                        onChange={(e) =>
                                          workCreateHandlers.handleCreditChange(
                                            index,
                                            "role",
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                                        placeholder="Role"
                                      />
                                    </div>
                                    <div className="w-full grid grid-cols-1 gap-y-4">
                                      <DragDropContext
                                        onDragEnd={(result) =>
                                          workCreateHandlers.handleNamesDragEnd(
                                            result,
                                            index
                                          )
                                        }
                                      >
                                        <Droppable
                                          droppableId={`names-${index}`}
                                        >
                                          {(provided) => (
                                            <div
                                              {...provided.droppableProps}
                                              ref={provided.innerRef}
                                            >
                                              {creditsItem.name.map(
                                                (item, nameIndex) => (
                                                  <Draggable
                                                    key={`name-${index}-${nameIndex}`}
                                                    draggableId={`name-${index}-${nameIndex}`}
                                                    index={nameIndex}
                                                  >
                                                    {(provided, snapshot) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-center gap-2 ${
                                                          nameIndex !==
                                                          creditsItem.name
                                                            .length -
                                                            1
                                                            ? "mb-6"
                                                            : ""
                                                        } ${
                                                          snapshot.isDragging
                                                            ? "opacity-75 bg-gray-100 rounded p-1"
                                                            : ""
                                                        }`}
                                                      >
                                                        <>
                                                          <div
                                                            {...provided.dragHandleProps}
                                                            className={`flex items-center justify-center p-1 text-white bg-black rounded-full cursor-grab active:cursor-grabbing ${
                                                              creditsItem.name
                                                                .length > 1
                                                                ? ""
                                                                : "opacity-0 pointer-events-none"
                                                            }`}
                                                          >
                                                            <FiMove size={24} />
                                                          </div>
                                                          <input
                                                            type="text"
                                                            value={item}
                                                            onChange={(e) =>
                                                              workCreateHandlers.handleCreditNameChange(
                                                                index,
                                                                nameIndex,
                                                                e.target.value
                                                              )
                                                            }
                                                            className="flex-1 p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                                                            placeholder="Name"
                                                          />
                                                          {creditsItem.name
                                                            .length > 1 && (
                                                            <button
                                                              onClick={() =>
                                                                workCreateHandlers.removeCreditName(
                                                                  index,
                                                                  nameIndex
                                                                )
                                                              }
                                                              className="text-red-500 hover:text-red-700"
                                                            >
                                                              <FiTrash2
                                                                size={18}
                                                              />
                                                            </button>
                                                          )}
                                                        </>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                )
                                              )}
                                              {provided.placeholder}
                                            </div>
                                          )}
                                        </Droppable>
                                      </DragDropContext>

                                      <button
                                        onClick={() =>
                                          workCreateHandlers.addCreditName(
                                            index
                                          )
                                        }
                                        className=" flex items-center gap-2 text-left text-green-500 hover:text-green-700 justify-self-end"
                                      >
                                        <FiPlusCircle /> Add name
                                      </button>
                                    </div>

                                    <div className="col-span-2 mt-4 justify-self-start mb-4">
                                      {workData.credits.length > 1 && (
                                        <button
                                          onClick={() =>
                                            modalHandlers.removeCredit(index)
                                          }
                                          className="text-red-700 text-xs hover:text-white font-bold flex items-center gap-1 border bg-red-200 hover:bg-red-500 border-red-500 px-4 py-2 rounded-md"
                                        >
                                          <FiX size={16} /> REMOVE THIS CREDIT
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <div className="w-[calc(50%-60px)] mt-16 mb-8">
                    <button
                      onClick={workCreateHandlers.addCredit}
                      className="mt-4 flex items-center text-white bg-black px-5 py-2 rounded-md gap-2 mb-4 justify-self-center"
                    >
                      <div className="rounded-full bg-white text-black flex items-center justify-center p-1 ">
                        <FiPlus />
                      </div>
                      <span>ADD NEW CREDIT</span>
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div
                id="year-field"
                className="w-full flex border-b border-black py-2 lg:py-5"
              >
                <div className="w-[78px] lg:mr-[52px] mr-[24px]">©</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  <select
                    value={workData.year}
                    onChange={(e) =>
                      workCreateHandlers.handleFieldChange(
                        "year",
                        e.target.value
                      )
                    }
                    className="w-full p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                  >
                    <option value="">Select Year</option>
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      for (
                        let year = currentYear;
                        year >= currentYear - 20;
                        year--
                      ) {
                        years.push(
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        );
                      }
                      return years;
                    })()}
                  </select>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Video Project Section */}
        <FadeInSection delay={0.3}>
          <div id="Video Project" className="lg:mb-[10px] mb-[10px]">
            <div className="px-5 mb-8 mt-16 lg:max-w-[50%]">
              <label className="text-lg font-medium text-black mb-2 block">
                Project Video <span className="text-red-700 ml-1"> *</span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={modalHandlers.openVideoProjectModal}
                  className="bg-black text-white px-4 py-2 rounded flex items-center hover:bg-gray-800 transition-colors"
                >
                  <FiUpload className="mr-2" size={16} />
                  Select Video from Gallery
                </button>
                {workData.videoProjectSrc && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Current: </span>
                    <span className="ml-1 max-w-xs truncate">
                      {workData.videoProjectSrc.split("/").pop() ||
                        "Selected video"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="relative w-full"
              style={{
                paddingBottom:
                  deviceType === "desktop"
                    ? "calc(56.25% - 62px)"
                    : "calc(86.25% - 62px)",
              }}
            >
              {workData.videoProjectSrc ? (
                <video
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  src={workData.videoProjectSrc}
                  poster={workData.videoProjectPosterUrl}
                  controls
                  controlsList="nodownload noplaybackrate"
                  playsInline
                  preload="metadata"
                  style={{ borderRadius: "0px" }}
                  onError={(e) => {
                    console.log("Showreel video failed to load:", e);
                  }}
                  onLoadedData={() => {
                    console.log("Showreel video loaded successfully");
                  }}
                  onPlay={(e) => {
                    // Auto fullscreen when video starts playing
                    if (e.target.requestFullscreen) {
                      e.target.requestFullscreen().catch((err) => {
                        console.log("Fullscreen request failed:", err);
                      });
                    } else if (e.target.webkitRequestFullscreen) {
                      e.target.webkitRequestFullscreen();
                    } else if (e.target.msRequestFullscreen) {
                      e.target.msRequestFullscreen();
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <button
                  onClick={modalHandlers.openVideoProjectModal}
                  className="absolute inset-0 flex items-center justify-center bg-[#000000c8] border text-white"
                >
                  No video selected
                </button>
              )}
            </div>
          </div>
        </FadeInSection>

        {/* Project Details */}
        <div id="gallery-section" className="w-full mx-auto lg:px-5 pb-24">
          <>
            {workData.images.length > 0 ? (
              <>
                {" "}
                {workData.images.map((image) => (
                  <div key={image.id} className="lg:mb-5 mb-[10px]">
                    <FadeInSection delay={0.3}>
                      {renderUtils.renderImage(
                        image.type,
                        image.imageUrl,
                        workData,
                        handleImageClick,
                        sliderPosition,
                        setSliderPosition,
                        isAnimating,
                        animateSlider,
                        animationRef
                      )}
                    </FadeInSection>
                  </div>
                ))}
              </>
            ) : (
              <div className="w-full pt-24">
                <div className="max-w-md mx-auto text-center">
                  {/* Empty State Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiImage size={40} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Empty State Message */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Project Gallery Yet
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Showcase your project with stunning visuals. Add images to
                      create a compelling gallery that tells your project's
                      story.
                    </p>
                  </div>

                  {/* Add Gallery Button */}
                  <button
                    onClick={galleryHandlers.openGalleryModal}
                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto shadow-md"
                  >
                    <FiImage className="mr-3" size={20} />
                    <span className="font-medium">Add Project Gallery</span>
                  </button>

                  {/* Helper Text */}
                  <p className="text-xs text-gray-400 mt-4">
                    You can add multiple image types including full-width,
                    columns, and before/after comparisons
                  </p>
                </div>
              </div>
            )}
          </>
        </div>
      </div>

      {/* Floating edit button bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 shadow-lg border-t border-gray-200 transition-transform duration-300`}
      >
        <div className=" mx-auto px-5 py-3 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <div>
              {/* Validation Status Indicator */}
              <div className="flex items-center gap-2 mt-1">
                {(() => {
                  const validation = workCreateHandlers.getValidationStatus();
                  if (validation.isValid) {
                    return (
                      <span className="text-green-600 text-xs flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Ready to publish/save
                      </span>
                    );
                  } else {
                    return (
                      <button
                        onClick={() =>
                          workCreateHandlers.scrollToMissingField()
                        }
                        className="text-red-600 flex items-center hover:text-red-800 transition-colors cursor-pointer"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                        Required fields must be filled{" "}
                        <div className="px-3 py-2 text-xs bg-red-500 ml-2 text-white rounded-md flex justify-center items-center gap-2 italic">
                          <FaLightbulb size={16} /> Show missing field
                        </div>
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {workData.images.length > 0 && (
              <button
                onClick={galleryHandlers.openGalleryModal}
                className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200 flex items-center"
              >
                <FiImage className="mr-2" />
                Edit Project Gallery
              </button>
            )}
            {(() => {
              const validation = workCreateHandlers.getValidationStatus();
              return (
                <>
                  <button
                    onClick={workCreateHandlers.savePublish}
                    disabled={isSaving || !validation.canPublish}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      isSaving || !validation.canPublish
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                    title={
                      !validation.canPublish
                        ? "Please complete all required fields to publish"
                        : ""
                    }
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Save and Publish
                      </>
                    )}
                  </button>
                  <button
                    onClick={workCreateHandlers.saveDraft}
                    disabled={isSaving || !validation.canSaveDraft}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      isSaving || !validation.canSaveDraft
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                    title={
                      !validation.canSaveDraft
                        ? "Title is required to save as draft"
                        : ""
                    }
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Save as Draft
                      </>
                    )}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add the gallery editor modal component */}
      <GalleryEditorModal
        isGalleryModalOpen={isGalleryModalOpen}
        setIsGalleryModalOpen={setIsGalleryModalOpen}
        galleryModalAnimated={galleryModalAnimated}
        setGalleryModalAnimated={setGalleryModalAnimated}
        tempImagesOrder={tempImagesOrder}
        closeGalleryModal={galleryHandlers.closeGalleryModal}
        openAddGalleryModal={galleryHandlers.openAddGalleryModal}
        handleDragEnd={workCreateHandlers.handleDragEnd}
        renderGalleryThumbnails={renderUtils.renderGalleryThumbnails}
        getGalleryTypeLabel={renderUtils.getGalleryTypeLabel}
        editGalleryItem={galleryHandlers.editGalleryItem}
        showRemoveConfirmation={galleryHandlers.showRemoveConfirmation}
        applyGalleryChanges={galleryHandlers.applyGalleryChanges}
      />

      {/* Add gallery item modal component */}
      <AddGalleryItemModal
        isAddGalleryModalOpen={isAddGalleryModalOpen}
        closeAddGalleryModal={galleryHandlers.closeAddGalleryModal}
        editingGalleryItem={editingGalleryItem}
        selectedImageType={selectedImageType}
        IMAGE_TYPES={IMAGE_TYPES}
        handleImageTypeChange={galleryHandlers.handleImageTypeChange}
        handleDragOver={mediaHandlers.handleDragOver}
        handleDrop={mediaHandlers.handleDrop}
        handleImageUpload={mediaHandlers.handleImageUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        selectedImages={selectedImages}
        handleImageSelection={galleryHandlers.handleImageSelection}
        loadingImages={loadingImages}
        availableImages={availableImages}
        updateGalleryItem={galleryHandlers.updateGalleryItem}
        addGalleryItem={galleryHandlers.addGalleryItem}
        // Upload modal props
        isImageUploadModalOpen={workCreateState.isImageUploadModalOpen}
        openImageUploadModal={galleryHandlers.openImageUploadModal}
        closeImageUploadModal={galleryHandlers.closeImageUploadModal}
        fetchAvailableImages={workCreateState.fetchAvailableImages}
      />

      {/* Remove confirmation modal component */}
      <RemoveConfirmationModal
        isRemoveConfirmOpen={isRemoveConfirmOpen}
        removeItemIndex={removeItemIndex}
        tempImagesOrder={tempImagesOrder}
        renderGalleryThumbnails={renderUtils.renderGalleryThumbnails}
        getGalleryTypeLabel={renderUtils.getGalleryTypeLabel}
        cancelRemoveConfirmation={galleryHandlers.cancelRemoveConfirmation}
        removeGalleryItem={galleryHandlers.removeGalleryItem}
      />

      {/* Credit removal confirmation modal component */}
      <CreditRemoveConfirmationModal
        isCreditRemoveConfirmOpen={isCreditRemoveConfirmOpen}
        removeCreditIndex={removeCreditIndex}
        workData={workData}
        cancelCreditRemoveConfirmation={
          modalHandlers.cancelCreditRemoveConfirmation
        }
        confirmCreditRemoval={modalHandlers.confirmCreditRemoval}
      />

      {/* Hero banner editor modal component */}
      <HeroBannerEditorModal
        isHeroBannerModalOpen={isHeroBannerModalOpen}
        closeHeroBannerModal={modalHandlers.closeHeroBannerModal}
        workData={workData}
        selectedHeroBannerImage={selectedHeroBannerImage}
        setSelectedHeroBannerImage={setSelectedHeroBannerImage}
        handleDragOver={mediaHandlers.handleDragOver}
        handleDrop={mediaHandlers.handleDrop}
        handleImageUpload={mediaHandlers.handleImageUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        loadingImages={loadingImages}
        availableImages={availableImages}
        handleHeroBannerImageSelection={
          modalHandlers.handleHeroBannerImageSelection
        }
        updateHeroBannerImage={modalHandlers.updateHeroBannerImage}
        // Upload modal props
        isImageUploadModalOpen={workCreateState.isImageUploadModalOpen}
        openImageUploadModal={modalHandlers.openImageUploadModal}
        closeImageUploadModal={modalHandlers.closeImageUploadModal}
        fetchAvailableImages={workCreateState.fetchAvailableImages}
      />

      {/* Video project editor modal component */}
      <VideoProjectEditorModal
        isVideoProjectModalOpen={isVideoProjectModalOpen}
        closeVideoProjectModal={modalHandlers.closeVideoProjectModal}
        workData={workData}
        selectedVideoProject={selectedVideoProject}
        setSelectedVideoProject={setSelectedVideoProject}
        handleDragOver={mediaHandlers.handleDragOver}
        handleVideoDrop={mediaHandlers.handleVideoDrop}
        handleVideoUpload={mediaHandlers.handleVideoUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        loadingVideos={loadingVideos}
        availableVideos={availableVideos}
        handleVideoProjectSelection={modalHandlers.handleVideoProjectSelection}
        updateVideoProject={modalHandlers.updateVideoProject}
        // Upload modal props
        isVideoUploadModalOpen={workCreateState.isVideoUploadModalOpen}
        openVideoUploadModal={modalHandlers.openVideoUploadModal}
        closeVideoUploadModal={modalHandlers.closeVideoUploadModal}
        fetchAvailableVideos={workCreateState.fetchAvailableVideos}
      />

      {/* Image popup modal */}
      <ImagePopup
        popupImage={popupImage}
        popupImageIndex={popupImageIndex}
        closePopup={closePopup}
        setPopupImageIndex={setPopupImageIndex}
        workData={workData}
      />
    </div>
  );
};

export default WorkCreate;
