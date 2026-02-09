import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navigation = ({ deviceType }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {deviceType === "desktop" ? (
        <header
          className={`bg-[#242021] fixed z-50 w-full text-[#EBE8E1] h-[50px] flex items-center py-[13px]`}
        >
          <nav className="w-full max-w-[1920px] mx-auto flex justify-between items-center px-[24px]">
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                id="logoParallel"
                className="text-xl font-bold flex justify-center items-center w-[186px] cursor-pointer"
              >
                <img src="/logo.png" alt="JLU Logo" />
              </Link>
              <div className="text-[11px] text-black px-2 bg-[#FED541] h-[20px] flex items-center justify-center font-medium">
                CMS
              </div>
            </div>

            <div className="space-x-[17px] text-[12px] font-medium">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/media"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Media Library
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  isActive ? "" : "hover:font-medium"
                }
              >
                Services
              </NavLink>
            </div>
          </nav>
        </header>
      ) : (
        <>
          <header className={`bg-[#242021] fixed z-50 w-full text-[#EBE8E1]`}>
            <nav className="w-full max-w-[1920px] mx-auto py-4 px-[20px] flex justify-between items-center">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="/logo.png"
                  alt="JLU Logo"
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
                  className={`w-6 h-0.5 bg-[#EBE8E1] mb-1.5 transition-all ${
                    mobileMenuOpen ? "transform rotate-45 translate-y-2" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-[#EBE8E1] mb-1.5 transition-all ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-[#EBE8E1] transition-all ${
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
            className={`fixed inset-0 bg-[#242021] z-40 transition-transform duration-300 ease-in-out text-[#EBE8E1] ${
              mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
            }`}
            style={{ top: "64px" }}
          >
            <div className="w-full mx-auto px-[20px] pb-8 flex flex-col uppercase text-sm">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block py-3 border-b border-[#EBE8E133] ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/media"
                className={({ isActive }) =>
                  `block py-3 border-b border-[#EBE8E133] ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Media
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `block py-3 border-b border-[#EBE8E133] ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `block py-3 border-b border-[#EBE8E133] ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `block py-3 border-b border-[#EBE8E133] ${isActive ? "" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
