import React from "react";

const Pagination = ({
  pagination,
  currentPage,
  handlePageChange,
  handlePrevPage,
  handleNextPage,
}) => {
  if (!pagination.last_page || pagination.last_page <= 1) {
    return null;
  }

  return (
    <div className="flex justify-end items-center gap-2">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded flex items-center gap-1 ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        Prev
      </button>

      <div className="flex gap-1">
        {/* First page */}
        {currentPage > 3 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            {currentPage > 4 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page numbers around current page */}
        {Array.from(
          { length: Math.min(5, pagination.last_page) },
          (_, i) => {
            const page =
              Math.max(
                1,
                Math.min(pagination.last_page - 4, currentPage - 2)
              ) + i;
            if (page > pagination.last_page) return null;

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded ${
                  page === currentPage
                    ? "bg-black border border-black text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          }
        )}

        {/* Last page */}
        {currentPage < pagination.last_page - 2 && (
          <>
            {currentPage < pagination.last_page - 3 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(pagination.last_page)}
              className="px-3 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {pagination.last_page}
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleNextPage}
        disabled={currentPage === pagination.last_page}
        className={`px-3 py-2 rounded flex items-center gap-1 ${
          currentPage === pagination.last_page
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;