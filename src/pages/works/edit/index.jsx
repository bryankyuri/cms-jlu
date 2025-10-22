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
  FiLoader,
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
import { useWorkEdit } from "./hooks/useWorkEdit.js";
import { useWorkEditHandlers } from "./hooks/useWorkEditHandlers.js";
import { useMediaHandlers } from "./hooks/useMediaHandlers.js";
import { useGalleryHandlers } from "./hooks/useGalleryHandlers.js";
import { useModalHandlers } from "./hooks/useModalHandlers.js";
import { renderUtils } from "../../../utils/renderUtils.jsx";

const WorkEdit = () => {
  const { deviceType } = useContext(AppContext);
  const navigate = useNavigate();

  // Available tag options (predefined)
  const AVAILABLE_TAGS = ["MOTION GRAPHIC", "COLOR GRADING", "VFX", "CGI"];

  // Available image types for gallery - grouped by category
  const IMAGE_TYPES = [
    // Full Width options
    { value: "full-16:9", label: "16:9", imageCount: 1, category: "Full Width" },
    { value: "full-1.85:1", label: "1.85:1", imageCount: 1, category: "Full Width" },
    { value: "full-2.35:1", label: "2.35:1", imageCount: 1, category: "Full Width" },
    { value: "full-2.39:1", label: "2.39:1", imageCount: 1, category: "Full Width" },
    { value: "full-4:3", label: "4:3", imageCount: 1, category: "Full Width" },
    // Two Column options
    { value: "2col-16:9", label: "16:9", imageCount: 2, category: "Two Column" },
    { value: "2col-1.85:1", label: "1.85:1", imageCount: 2, category: "Two Column" },
    { value: "2col-2.35:1", label: "2.35:1", imageCount: 2, category: "Two Column" },
    { value: "2col-2.39:1", label: "2.39:1", imageCount: 2, category: "Two Column" },
    { value: "2col-4:3", label: "4:3", imageCount: 2, category: "Two Column" },
    // Before/After Comparison options
    { value: "compare-16:9", label: "16:9", imageCount: 2, category: "Before/After Comparison" },
    { value: "compare-1.85:1", label: "1.85:1", imageCount: 2, category: "Before/After Comparison" },
    { value: "compare-2.35:1", label: "2.35:1", imageCount: 2, category: "Before/After Comparison" },
    { value: "compare-2.39:1", label: "2.39:1", imageCount: 2, category: "Before/After Comparison" },
    { value: "compare-4:3", label: "4:3", imageCount: 2, category: "Before/After Comparison" },
  ];

  // Use custom hooks
  const workEditState = useWorkEdit();

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
    backgroundPosX,
    setBackgroundPosX,
    backgroundPosY,
    setBackgroundPosY,
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
    heroBannerFillMode,
    activeVideoTab,
    setActiveVideoTab,
    isVideoPlaying,
    setIsVideoPlaying,
    hasVideoStarted,
    setHasVideoStarted,
    // Loading states
    isLoading,
    loadError,
    // Functions
    animateSlider,
    handleImageClick,
    closePopup,
  } = workEditState;

  const workEditHandlers = useWorkEditHandlers(
    workData,
    workEditState.setWorkData,
    setTempImagesOrder,
    tempImagesOrder,
    isSaving,
    workEditState.setIsSaving,
    navigate,
    workData.id // Pass the work ID for updates
  );

  const mediaHandlers = useMediaHandlers(
    workEditState.setIsUploading,
    workEditState.setUploadProgress,
    workEditState.fetchAvailableImages,
    workEditState.fetchAvailableVideos
  );

  const galleryHandlers = useGalleryHandlers(
    IMAGE_TYPES,
    workData,
    workEditState.setWorkData,
    tempImagesOrder,
    setTempImagesOrder,
    selectedImages,
    workEditState.setSelectedImages,
    selectedImageType,
    workEditState.setSelectedImageType,
    setIsGalleryModalOpen,
    workEditState.setGalleryModalAnimated,
    workEditState.setIsAddGalleryModalOpen,
    workEditState.setEditingGalleryItem,
    workEditState.setIsRemoveConfirmOpen,
    workEditState.setRemoveItemIndex,
    workEditState.fetchAvailableImages,
    workEditState.setIsImageUploadModalOpen,
    editingGalleryItem
  );

  const modalHandlers = useModalHandlers(
    workData,
    workEditState.setWorkData,
    workEditState.setIsCreditRemoveConfirmOpen,
    workEditState.setRemoveCreditIndex,
    workEditState.setIsHeroBannerModalOpen,
    selectedHeroBannerImage,
    workEditState.setSelectedHeroBannerImage,
    workEditState.setIsVideoProjectModalOpen,
    selectedVideoProject,
    workEditState.setSelectedVideoProject,
    workEditState.fetchAvailableImages,
    workEditState.fetchAvailableVideos,
    workEditState.setIsImageUploadModalOpen,
    workEditState.setIsVideoUploadModalOpen
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading work data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => navigate("/works")}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Back to Works
          </button>
        </div>
      </div>
    );
  }

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
            backgroundSize: heroBannerFillMode,
            backgroundPosition: `${workData.heroBannerPositionX || 'center'} ${workData.heroBannerPositionY || 'top'}`,
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
                    workEditHandlers.handleTagToggle(
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
                      workEditHandlers.handleFieldChange(
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
                      workEditHandlers.handleFieldChange(
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
                      workEditHandlers.handleFieldChange(
                        "category",
                        e.target.value
                      )
                    }
                    className="w-full p-1 focus:outline-none bg-gray-50 border rounded-md border-black"
                  >
                    <option value="film/series">Film/Series</option>
                    <option value="commercial">Commercial</option>
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
                      workEditHandlers.handleFieldChange(
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
                    onDragEnd={workEditHandlers.handleCreditsDragEnd}
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
                                          workEditHandlers.handleCreditChange(
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
                                          workEditHandlers.handleNamesDragEnd(
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
                                                              workEditHandlers.handleCreditNameChange(
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
                                                                workEditHandlers.removeCreditName(
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
                                          workEditHandlers.addCreditName(index)
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
                      onClick={workEditHandlers.addCredit}
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
                      workEditHandlers.handleFieldChange("year", e.target.value)
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
          <div id="Video Project" className="lg:mb-[10px] mb-[10px">
            <div className="px-5 mb-8 mt-16 lg:max-w-[50%]">
              <label className="text-lg font-medium text-black mb-2 block">
                Project Video <span className="text-red-700 ml-1"> *</span>
              </label>
              
              {/* Helper text */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ At least one video source is required:</strong> You can upload a video to the media gallery, or provide a Vimeo, YouTube, or Cloudflare Stream URL. Multiple sources are supported.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={modalHandlers.openVideoProjectModal}
                    className="bg-black text-white px-4 py-2 rounded flex items-center hover:bg-gray-800 transition-colors"
                  >
                    <FiUpload className="mr-2" size={16} />
                    Select Video from Gallery
                  </button>
                  {workData.videoProjectSrc && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span>Current: </span>
                        <span className="ml-1 max-w-xs truncate">
                          {workData.videoProjectSrc.split("/").pop() ||
                            "Selected video"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          workEditHandlers.handleFieldChange("videoProjectSrc", "");
                          workEditHandlers.handleFieldChange("videoProjectPoster", "");
                        }}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Remove selected video"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Vimeo Embed URL (optional)
                    </label>
                    <input
                      type="url"
                      value={workData.videoVimeoUrl}
                      onChange={(e) =>
                        workEditHandlers.handleFieldChange(
                          "videoVimeoUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://vimeo.com/yourvideo"
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      YouTube URL (optional)
                    </label>
                    <input
                      type="url"
                      value={workData.videoYoutubeUrl}
                      onChange={(e) =>
                        workEditHandlers.handleFieldChange(
                          "videoYoutubeUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://youtube.com/watch?v=yourvideo"
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cloudflare Stream Embed URL (optional)
                    </label>
                    <input
                      type="url"
                      value={workData.videoCloudflareUrl}
                      onChange={(e) =>
                        workEditHandlers.handleFieldChange(
                          "videoCloudflareUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://watch.videodelivery.net/your-uuid"
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative w-full bg-black"
              style={{
                paddingBottom:
                  deviceType === "desktop"
                    ? "calc(56.25% - 62px)"
                    : "calc(86.25% - 62px)",
              }}
            >
              {/* Video Player Tabs */}
              {(workData.videoProjectSrc ? 1 : 0) + 
               (workData.videoVimeoUrl ? 1 : 0) + 
               (workData.videoYoutubeUrl ? 1 : 0) + 
               (workData.videoCloudflareUrl ? 1 : 0) > 1 && (
                <div className="absolute top-0 left-0 z-10 flex bg-black bg-opacity-70 rounded-tr-md">
                  {workData.videoProjectSrc && (
                    <button
                      onClick={() => setActiveVideoTab("uploaded")}
                      className={`px-3 py-1 text-xs font-medium ${
                        activeVideoTab === "uploaded"
                          ? "bg-white text-black"
                          : "text-white hover:bg-white hover:bg-opacity-20"
                      }`}
                    >
                      Optimized (Low Bit Rate)
                    </button>
                  )}
                  {workData.videoVimeoUrl && (
                    <button
                      onClick={() => setActiveVideoTab("vimeo")}
                      className={`px-3 py-1 text-xs font-medium ${
                        activeVideoTab === "vimeo"
                          ? "bg-white text-black"
                          : "text-white hover:bg-white hover:bg-opacity-20"
                      }`}
                    >
                      Vimeo
                    </button>
                  )}
                  {workData.videoYoutubeUrl && (
                    <button
                      onClick={() => setActiveVideoTab("youtube")}
                      className={`px-3 py-1 text-xs font-medium ${
                        activeVideoTab === "youtube"
                          ? "bg-white text-black"
                          : "text-white hover:bg-white hover:bg-opacity-20"
                      }`}
                    >
                      YouTube
                    </button>
                  )}
                  {workData.videoCloudflareUrl && (
                    <button
                      onClick={() => setActiveVideoTab("cloudflare")}
                      className={`px-3 py-1 text-xs font-medium ${
                        activeVideoTab === "cloudflare"
                          ? "bg-white text-black"
                          : "text-white hover:bg-white hover:bg-opacity-20"
                      }`}
                    >
                      Cloudflare
                    </button>
                  )}
                </div>
              )}

              {/* Video Player Content */}
              {activeVideoTab === "uploaded" && workData.videoProjectSrc ? (
                <>
                  {/* Custom Poster Overlay */}
                  {!hasVideoStarted && workData.videoProjectPosterUrl && (
                    <>
                      <img
                        src={workData.videoProjectPosterUrl}
                        alt="Video poster"
                        className="absolute top-0 left-0 w-full h-full object-cover z-20"
                      />
                      
                      {/* Overlay content */}
                      <div className="absolute inset-0 z-30">
                        {/* Title on top left */}
                        <div className="absolute top-4 left-4 lg:top-6 lg:left-6">
                          <h2 className="text-white text-lg lg:text-2xl font-bold drop-shadow-lg">
                            {workData.title}
                          </h2>
                        </div>
                        
                        {/* Play button in center */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const video = e.target.closest('.relative').querySelector('video');
                            if (video) {
                              video.play();
                            }
                          }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 hover:bg-opacity-100 rounded-full w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          aria-label="Play video"
                        >
                          {/* Play icon SVG */}
                          <svg 
                            className="w-10 h-10 lg:w-12 lg:h-12 text-white ml-1" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                  
                  <video
                    id="video-project-player"
                    className="absolute top-0 left-0 w-full h-full object-contain"
                    src={workData.videoProjectSrc}
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
                      setIsVideoPlaying(true);
                      setHasVideoStarted(true);
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
                    onPause={() => {
                      setIsVideoPlaying(false);
                    }}
                    onEnded={() => {
                      setIsVideoPlaying(false);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </>
              ) : activeVideoTab === "vimeo" && workData.videoVimeoUrl ? (
                <iframe
                  id="video-project-player"
                  className="absolute top-0 left-0 w-full h-full"
                  src={workData.videoVimeoUrl}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; accelerometer; encrypted-media; gyroscope"
                  allowFullScreen
                  title="Vimeo Video"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    border: "none",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}
                />
              ) : activeVideoTab === "youtube" && workData.videoYoutubeUrl ? (
                <iframe
                  id="video-project-player"
                  className="absolute top-0 left-0 w-full h-full"
                  src={workData.videoYoutubeUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : activeVideoTab === "cloudflare" && workData.videoCloudflareUrl ? (
                <iframe
                  id="video-project-player"
                  className="absolute top-0 left-0 w-full h-full"
                  src={workData.videoCloudflareUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Cloudflare Stream Video"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
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
                  const validation = workEditHandlers.getValidationStatus();
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
                        onClick={() => workEditHandlers.scrollToMissingField()}
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
              const validation = workEditHandlers.getValidationStatus();
              return (
                <>
                  <button
                    onClick={workEditHandlers.saveUpdates}
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Save Changes
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
        handleDragEnd={workEditHandlers.handleDragEnd}
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
        isImageUploadModalOpen={workEditState.isImageUploadModalOpen}
        openImageUploadModal={galleryHandlers.openImageUploadModal}
        closeImageUploadModal={galleryHandlers.closeImageUploadModal}
        fetchAvailableImages={workEditState.fetchAvailableImages}
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
        isImageUploadModalOpen={workEditState.isImageUploadModalOpen}
        openImageUploadModal={modalHandlers.openImageUploadModal}
        closeImageUploadModal={modalHandlers.closeImageUploadModal}
        fetchAvailableImages={workEditState.fetchAvailableImages}
        // Background position props
        backgroundPosX={backgroundPosX}
        setBackgroundPosX={setBackgroundPosX}
        backgroundPosY={backgroundPosY}
        setBackgroundPosY={setBackgroundPosY}
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
        isVideoUploadModalOpen={workEditState.isVideoUploadModalOpen}
        openVideoUploadModal={modalHandlers.openVideoUploadModal}
        closeVideoUploadModal={modalHandlers.closeVideoUploadModal}
        fetchAvailableVideos={workEditState.fetchAvailableVideos}
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

export default WorkEdit;
