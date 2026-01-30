import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ deviceType }) => {
  return (
    <footer className="bg-[#242021] text-white">
      {deviceType === "desktop" ? (
        <div className="w-full max-w-[1920px] mx-auto flex justify-between items-end pb-[30px] pt-4 border-t border-[#EBE8E133] px-[24px]">
          <div className="flex flex-col w-full">
            <img
              src="/logoIcon.png"
              className="w-[24px] h-[24px] mb-[59px]"
              alt="JLU Icon"
            />
            <div className="text-[#EBE8E180] font-medium text-[12px]">
              © 2025 Jakarta Lubrication Unit. All rights reserved.
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 mb-[59px] max-w-[323px]">
              <Link
                to="/"
                className="text-white text-[12px] font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/media"
                className="text-white text-[12px] font-medium"
              >
                Media Library
              </Link>
              <Link
                to="/projects"
                className="text-white text-[12px] font-medium"
              >
                Projects
              </Link>
              <Link
                to="/products"
                className="text-white text-[12px] font-medium"
              >
                Products
              </Link>
            </div>
          </div>
          <div className="w-full"></div>
        </div>
      ) : (
        <div className="w-full max-w-[1920px] mx-auto flex justify-between py-5 text-[10px] font-semibold border-t border-[#EBE8E133] px-[24px]">
          <div className="text-left">
            <img
              src="/logoIcon.png"
              className="w-[20px] h-[20px] mb-2"
              alt="JLU Icon"
            />
            <div className="text-[#EBE8E180]">
              © 2025 Jakarta Lubrication Unit.
              <br />
              All rights reserved.
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
