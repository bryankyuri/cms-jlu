import React, { useContext, useEffect, useState } from "react";
import ImagePopup from "../../../components/ImagePopup.jsx";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../../styles/WorkDetail.module.scss";
import { AppContext } from "../../../context/AppContext.jsx";
import { FadeInSection } from "../../../components/FadeInSection.jsx";
import {
  FiEdit,
  FiArrowLeft,
  FiEye,
  FiCalendar,
  FiTag,
  FiUser,
  FiVideo,
  FiImage,
  FiLoader,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import API
import { worksAPI } from "../../../api/index.js";

// Import utils
import { renderUtils } from "../../../utils/renderUtils.jsx";

const WorkDetail = () => {
  const { deviceType } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  // State for work data
  const [workData, setWorkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = React.useRef(null);

  // Popup state
  const [popupImage, setPopupImage] = useState(null);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  // Available tag options (predefined)
  const AVAILABLE_TAGS = ["MOTION GRAPHIC", "COLOR GRADING", "VFX", "CGI"];

  // Fetch work data
  useEffect(() => {
    const fetchWorkData = async () => {
      try {
        setLoading(true);
        const response = await worksAPI.get(id);
        
        if (response.success) {
          setWorkData(response.data);
        } else {
          setError(response.message || "Failed to load work details");
          toast.error("Failed to load work details");
        }
      } catch (err) {
        console.error("Error fetching work:", err);
        setError("Failed to load work details");
        toast.error("Failed to load work details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkData();
    }
  }, [id]);

  // Animation and interaction handlers
  const animateSlider = (targetPosition) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const startPosition = sliderPosition;
    const distance = targetPosition - startPosition;
    const duration = 300;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = startPosition + (distance * easeProgress);
      setSliderPosition(currentPosition);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleImageClick = (imageUrl, index = 0) => {
    setPopupImage(imageUrl);
    setPopupImageIndex(index);
  };

  const closePopup = () => {
    setPopupImage(null);
    setPopupImageIndex(0);
  };

  const handleEditClick = () => {
    navigate(`/works/edit/${id}`);
  };

  const handleBackClick = () => {
    navigate('/works');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl mb-4 mx-auto" />
          <p className="text-gray-600">Loading work details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !workData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Work not found"}</p>
          <button
            onClick={handleBackClick}
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

      <div className="w-full mx-auto">
        {/* Hero Banner Section */}
        <div
          className={`hero-banner-section w-full bg-black text-white relative ${styles.heroBanner} lg:mb-5 mb-[10px]`}
          style={{
            height:
              deviceType === "desktop"
                ? "calc(100vh - 62px)"
                : "calc(100vh - 66px)",
            backgroundImage: workData.hero_banner_image ? `url(${workData.hero_banner_image})` : 'none',
            backgroundSize:
              deviceType === "desktop" ? "100% auto" : "auto 100%",
            backgroundPosition:
              deviceType === "desktop" ? `center 0px` : "center 0px",
            backgroundRepeat: "no-repeat",
          }}
        >
          {!workData.hero_banner_image && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                <p className="opacity-75">No Hero Banner Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed top-24 right-6 flex flex-col gap-3 z-50">
          <button
            onClick={handleBackClick}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg flex items-center hover:bg-gray-700 transition-colors shadow-lg backdrop-blur-sm"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Back
          </button>
          
          <button
            onClick={handleEditClick}
            className="bg-black text-white px-4 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors shadow-lg backdrop-blur-sm"
          >
            <FiEdit className="mr-2" size={16} />
            Edit
          </button>
        </div>

        {/* Tags Section */}
        <div className="w-full px-5 py-2">
          <div className="flex gap-2 flex-wrap">
            <div className="font-semibold text-white bg-black px-2 py-1 rounded-[4px] flex items-center">
              <FiTag className="mr-1" size={14} />
              #
            </div>
            {workData.tags && workData.tags.length > 0 ? (
              workData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="font-semibold px-2 py-1 rounded-[4px] text-white bg-black"
                >
                  {tag}
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic px-2 py-1">No tags</div>
            )}
          </div>
        </div>

        {/* Work Details */}
        <div className="w-full lg:text-[20px] text-[14px] text-black mx-auto px-5 flex my-[20px] lg:justify-end lg:flex-row flex-col-reverse border-b">
          <div className="w-full border-t lg:border-t-0 border-b border-black">
            
            {/* Status Badge */}
            <FadeInSection delay={0.1}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[78px] lg:mr-[60px] mr-[24px] flex items-center">
                  <FiEye className="mr-2" size={16} />
                  STATUS
                </div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      workData.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {workData.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[78px] lg:mr-[60px] mr-[24px] flex items-center">
                  <FiUser className="mr-2" size={16} />
                  CLIENT
                </div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  {workData.client}
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.3}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[78px] lg:mr-[60px] mr-[24px]">TITLE</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                  {workData.title}
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.4}>
              <div className="w-full flex border-b border-black py-2 lg:py-5">
                <div className="w-[78px] lg:mr-[60px] mr-[24px]">CATEGORY</div>
                <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium capitalize">
                  {workData.category}
                </div>
              </div>
            </FadeInSection>
            
            {workData.description && (
              <FadeInSection delay={0.5}>
                <div className="w-full flex border-b border-black py-2 lg:py-5">
                  <div className="w-[78px] lg:mr-[60px] mr-[24px]">DESC.</div>
                  <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] text-justify font-medium whitespace-pre-wrap">
                    {workData.description}
                  </div>
                </div>
              </FadeInSection>
            )}
            
            {/* Credits Section */}
            {workData.credits && workData.credits.length > 0 && (
              <FadeInSection delay={0.6}>
                <div className="w-full flex pt-2 lg:pt-5">
                  <div className="w-[78px] lg:mr-[60px] mr-[24px]">CREDITS</div>
                  <div className="w-full font-medium">
                    {workData.credits.map((credit, index) => (
                      <div
                        key={index}
                        className={`w-full ${
                          workData.credits.length - 1 !== index
                            ? "pb-2 border-b border-black lg:pb-5 mb-2 lg:mb-5"
                            : "pb-2 border-b border-black lg:pb-5"
                        }`}
                      >
                        <div className="lg:w-[calc(50%-60px)] w-[calc(100%-76px)] grid grid-cols-2 gap-x-12">
                          <div className="font-semibold">{credit.role}</div>
                          <div className="grid grid-cols-1 gap-y-2">
                            {credit.names && credit.names.map((name, nameIndex) => (
                              <div key={nameIndex}>{name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}
            
            {/* Year Section */}
            {workData.year && (
              <FadeInSection delay={0.7}>
                <div className="w-full flex border-b border-black py-2 lg:py-5">
                  <div className="w-[78px] lg:mr-[52px] mr-[24px] flex items-center">
                    <FiCalendar className="mr-2" size={16} />©
                  </div>
                  <div className="lg:w-[calc(50%-120px)] w-[calc(100%-76px)] font-medium">
                    {workData.year}
                  </div>
                </div>
              </FadeInSection>
            )}
          </div>
        </div>

        {/* Video Project Section */}
        {workData.video_project_src && (
          <FadeInSection delay={0.8}>
            <div className="lg:mb-[10px] mb-[10px]">
              <div className="px-5 mb-8 mt-16">
                <label className="text-lg font-medium text-black mb-2 flex items-center">
                  <FiVideo className="mr-2" />
                  Project Video
                </label>
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
                <video
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  src={workData.video_project_src}
                  poster={workData.video_project_poster}
                  controls
                  controlsList="nodownload noplaybackrate"
                  playsInline
                  preload="metadata"
                  style={{ borderRadius: "0px" }}
                  onError={(e) => {
                    console.log("Video failed to load:", e);
                  }}
                  onLoadedData={() => {
                    console.log("Video loaded successfully");
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
              </div>
            </div>
          </FadeInSection>
        )}

        {/* Project Gallery */}
        <div className="w-full mx-auto lg:px-5 pb-24">
          {workData.gallery_items && workData.gallery_items.length > 0 ? (
            workData.gallery_items.map((item, index) => (
              <div key={item.id || index} className="lg:mb-5 mb-[10px]">
                <FadeInSection delay={0.3 * (index + 1)}>
                  {renderUtils.renderImage(
                    item.type,
                    item.images,
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
            ))
          ) : (
            <div className="w-full pt-24">
              <div className="max-w-md mx-auto text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiImage size={40} className="text-gray-400" />
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Project Gallery
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    This work doesn't have any gallery images yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default WorkDetail;