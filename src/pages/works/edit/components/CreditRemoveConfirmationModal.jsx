import React from "react";
import { FiTrash2 } from "react-icons/fi";

const CreditRemoveConfirmationModal = ({
  isCreditRemoveConfirmOpen,
  removeCreditIndex,
  workData,
  cancelCreditRemoveConfirmation,
  confirmCreditRemoval
}) => {
  if (!isCreditRemoveConfirmOpen || removeCreditIndex === null) return null;

  const creditToRemove = workData.credits[removeCreditIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fadeIn">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <FiTrash2 className="text-red-600" size={24} />
          </div>

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Remove Credit
          </h3>

          <p className="text-gray-500 text-center mb-6">
            Are you sure you want to remove this credit?
          </p>

          {/* Preview of credit being removed */}
          {creditToRemove && (
            <div className="flex items-center bg-gray-50 rounded-lg p-3 mb-6">
              <div className="ml-3 flex-grow">
                <div className="font-medium text-sm">
                  {creditToRemove.role || 'Unnamed Role'}
                </div>
                <div className="text-xs text-gray-500">
                  {creditToRemove.name.join(', ') || 'No names'}
                </div>
                <div className="text-xs text-gray-400">
                  Position {removeCreditIndex + 1}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={cancelCreditRemoveConfirmation}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              onClick={() => confirmCreditRemoval(removeCreditIndex)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditRemoveConfirmationModal;