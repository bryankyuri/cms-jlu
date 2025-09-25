import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ModalPagination = ({
  pagination,
  currentPage,
  handlePageChange,
  handlePrevPage,
  handleNextPage,
  size = "small" // small or normal
}) => {
  if (!pagination || !pagination.last_page || pagination.last_page <= 1) {
    return null;
  }

  const totalPages = pagination.last_page;
  const maxVisiblePages = size === "small" ? 3 : 5;
  
  // Calculate page range to display
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const buttonClass = size === "small" 
    ? "px-2 py-1 text-xs"
    : "px-3 py-2 text-sm";

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Previous button */}
      <button
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
        className={`${buttonClass} border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
      >
        <FiChevronLeft size={size === "small" ? 12 : 16} />
        {size !== "small"}
      </button>

      {/* First page and ellipsis */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className={`${buttonClass} border border-gray-300 rounded-md hover:bg-gray-50`}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`${buttonClass} border rounded-md ${
            page === currentPage
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page and ellipsis */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`${buttonClass} border border-gray-300 rounded-md hover:bg-gray-50`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
        className={`${buttonClass} border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
      >
        {size !== "small"}
        <FiChevronRight size={size === "small" ? 12 : 16} />
      </button>
    </div>
  );
};

export default ModalPagination;