import React, { useEffect, useRef } from "react";

const DeleteModel = ({
  onCancel,
  onDeleteForMe,
  onDeleteForEveryone,
  isModelOpen,
  setIsModelOpen,
}) => {
  const modelRef = useRef(null);

  useEffect(() => {
    const handlePopUp = (event) => {
      if (modelRef?.current && !modelRef.current.contains(event.target)) {
        setIsModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePopUp);
    return () => document.removeEventListener("mousedown", handlePopUp);
  }, [setIsModelOpen]);

  if (!isModelOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4">
      {/* Modal Box - Styled to match your white chat area and purple theme */}
      <div
        ref={modelRef}
        className="bg-white w-full max-w-[340px] rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100"
      >
        <div className="p-6">
          <h3 className="text-gray-800 text-[18px] font-semibold mb-6">
            Delete message?
          </h3>

          {/* Action Buttons - Using Indigo to match your sidebar and sent bubbles */}
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={onDeleteForEveryone}
              className="w-full text-right py-3 px-4 text-indigo-600 hover:bg-indigo-50 transition-colors font-semibold text-sm uppercase tracking-wide rounded-xl"
            >
              Delete for everyone
            </button>

            <button
              onClick={onDeleteForMe}
              className="w-full text-right py-3 px-4 text-indigo-600 hover:bg-indigo-50 transition-colors font-semibold text-sm uppercase tracking-wide rounded-xl"
            >
              Delete for me
            </button>

            <button
              onClick={onCancel}
              className="w-full text-right py-3 px-4 text-gray-500 hover:bg-gray-100 transition-colors font-semibold text-sm uppercase tracking-wide rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModel;