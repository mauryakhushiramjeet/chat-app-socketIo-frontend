import React, { useEffect, useRef } from "react";
import { FaCheck, FaRegSmile } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx"; // Using RxCross2 for a clean thin cross

const EditMessageArea = ({
  editedMessage,
  setEditedMessage,
  onCancel,
  onSave,
}) => {
  const textAreaRef = useRef(null);
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [editedMessage]);
  return (
    <div className="w-full border border-gray-200 rounded-xl shadow-sm bg-white">
      {/* Text Area Section */}
      <textarea
        ref={textAreaRef}
        value={editedMessage}
        onChange={(e) => {
          setEditedMessage(e.target.value);
        }}
        className="w-full  max-h-[300px] py-4 px-6 bg-white text-gray-700 outline-none resize-none text-sm custom-scrollbar"
        placeholder="Edit your message..."
        autoFocus
      />

      {/* Action Footer Section */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
        {/* Left Side: Emoji */}
        <button className="p-2 text-gray-500 hover:text-[#574CD6] transition-colors">
          <FaRegSmile size={18} />
        </button>

        {/* Right Side: Cancel and Save */}
        <div className="flex items-center gap-2">
          {/* Cross / Cancel Button */}
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
            title="Cancel"
          >
            <RxCross2 size={20} />
          </button>

          {/* Check / Save Button */}
          <button
            onClick={onSave}
            className="p-2 bg-[#574CD6] text-white rounded-lg hover:bg-[#4633A6] shadow-md transition-all flex items-center justify-center"
            title="Save changes"
          >
            <FaCheck size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageArea;
