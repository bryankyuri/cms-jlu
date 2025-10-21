import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  IconA1,
  IconA2,
  IconD,
  IconE,
  IconI,
  IconL1,
  IconL2,
  IconL3,
  IconL4,
  IconL5,
  IconL6,
  IconO,
  IconP,
  IconR,
  IconS,
  IconT,
  IconU,
} from "./Icon/LogoCharacters";

const Navigation = ({ deviceType }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Track animation step (0-4) and hover state
  const [animationStep, setAnimationStep] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const animationTimerRef = useRef(null);

  // Animation durations for each step (in ms)
  const stepDurations = [0, 600, 450, 450, 600];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle mouse events
  const handleMouseEnter = () => {
    setIsHovering(true);
    // Start the animation sequence by moving to step 1
    if (animationStep === 0) {
      setAnimationStep(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Return to idle state
    setAnimationStep(0);

    // Clear any pending timers
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  };

  // Effect to manage animation progression
  useEffect(() => {
    // Skip for idle state (step 0)
    if (animationStep === 0) return;

    // Set timer for current step
    animationTimerRef.current = setTimeout(() => {
      // If still hovering, advance to next step or loop back to step 1
      if (isHovering) {
        if (animationStep < 4) {
          setAnimationStep(animationStep + 1);
        } else {
          // After step 4, go back to step 1 to create a loop
          setAnimationStep(1);
        }
      } else {
        // If no longer hovering, return to idle
        setAnimationStep(0);
      }
    }, stepDurations[animationStep]);

    // Cleanup function to clear timer if component unmounts or step changes
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [animationStep, isHovering]);

  console.log(`${animationStep}`);
  return (
    <>
      {deviceType === "desktop" ? (
        <header
          className={`bg-white fixed z-50 w-full text-black h-[62px] flex items-center`}
        >
          <nav className="w-full mx-auto py-4 px-5 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                id="logoParallel"
                className={`text-xl font-bold flex step-${animationStep} justify-center items-center w-[197px]`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <IconP />
                <IconA1 />
                <IconR />
                <IconA2 />
                <div className="flex relative l-container overflow-hidden">
                  <div className="overflow-hidden l-wrapper">
                    <IconL1 />
                  </div>
                  <div className="overflow-hidden l-wrapper">
                    <IconL2 />
                  </div>
                  <div className="overflow-hidden l-wrapper">
                    <IconL3 />
                  </div>
                  <div className="overflow-hidden l-wrapper">
                    <IconL4 />
                  </div>
                  <div className="overflow-hidden l-wrapper">
                    <IconL5 />
                  </div>
                  <div className="rectangle absolute left-[0.5px] top-[0.1px] h-[15.8px] bg-black" />
                </div>
                <IconE />
                <IconL6 />
                <span className="w-[7px]"></span>
                <IconS />
                <IconT />
                <IconU />
                <IconD />
                <IconI />
                <IconO />
              </Link>
              <div className="text-[11px] text-white px-2  bg-black h-[20px] flex items-center justify-center">
                CMS
              </div>
            </div>

            <div className="space-x-5 uppercase text-[18px] font-medium">
              <NavLink
                to="/video-banner"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                VIDEO BANNER
              </NavLink>
              <span>I</span>
              <NavLink
                to="/showreel"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                SHOWREEL
              </NavLink>
              <span>I</span>
              <NavLink
                to="/works"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Works
              </NavLink>
              <span>I</span>
              <NavLink
                to="/media"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Media Library
              </NavLink>
              <span>I</span>
              <NavLink
                to="/contact-submissions"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Contact Submissions
              </NavLink>
       
             
              {/* <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Contact
              </NavLink> */}
            </div>
          </nav>
        </header>
      ) : (
        <>
          <header className={`bg-white fixed z-50 w-full text-black`}>
            <nav className="w-full mx-auto py-4 px-[20px] flex justify-between items-center">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  className=" invert"
                  src="/logo.png"
                  alt="Logo"
                  width={"198px"}
                  height={"auto"}
                />
              </Link>

              <button
                onClick={toggleMobileMenu}
                className="p-2 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                <div
                  className={`w-6 h-0.5 bg-black mb-1.5 transition-all ${
                    mobileMenuOpen ? "transform rotate-45 translate-y-2" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-black mb-1.5 transition-all ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-black transition-all ${
                    mobileMenuOpen
                      ? "transform -rotate-45 translate-y-[-8px]"
                      : ""
                  }`}
                ></div>
              </button>
            </nav>
          </header>
          {/* Mobile menu drawer */}
          <div
            className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out text-black ${
              mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
            }`}
            style={{ top: "64px" }}
          >
            <div className="w-full mx-auto px-[20px] pb-8 flex flex-col uppercase text-sm">
              <NavLink
                to="/video-banner"
                className={({ isActive }) =>
                  `block py-3 border-b ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Video Banner
              </NavLink>
              <NavLink
                to="/showreel"
                className={({ isActive }) =>
                  `block py-3 border-b ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Showreel
              </NavLink>
              <NavLink
                to="/works"
                className={({ isActive }) =>
                  `block py-3 border-b ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Works
              </NavLink>
              <NavLink
                to="/media"
                className={({ isActive }) =>
                  `block py-3 border-b ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Media
              </NavLink>

              <NavLink
                to="/contact-submissions"
                className={({ isActive }) =>
                  `block py-3 border-b ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Submissions
              </NavLink>

               <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `block py-3 border-b ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Category
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
