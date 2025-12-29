import React, { useEffect, useRef } from "react";
import TypingIndicator from "../component/TypingIndicator";
import { IoSend } from "react-icons/io5";
import Picker from "emoji-picker-react";
import { LuSmilePlus } from "react-icons/lu";

const InputBox = ({
  typingUserId,
  selectedUser,
  setMessage,
  message,
  handleMessage,
  handleSendMessage,
  setShowImozi,
  showImozi,
}) => {
  const imoziPickerRef = useRef(null);
  useEffect(() => {
    const handleImoziPickerClick = (e) => {
      if (
        imoziPickerRef.current &&
        !imoziPickerRef.current.contains(e.target)
      ) {
        setShowImozi(false);
      }
    };
    document.addEventListener("mousedown", handleImoziPickerClick);
    return () =>
      document.removeEventListener("mousedown", handleImoziPickerClick);
  }, [showImozi]);
  return (
    <div className="">
      {typingUserId === selectedUser?.id && (
        <div className="flex gap-1 items-center pb-[2px]">
          <img
            src={selectedUser?.image}
            alt="selected user image"
            className="h-6 w-6 rounded-full object-contain"
          />
          <TypingIndicator />
        </div>
      )}
      <div className="border-gray-200 flex gap-2">
        <div className="relative w-full flex items-center">
          {showImozi && (
            <div
              ref={imoziPickerRef}
              className="absolute right-0 bottom-[43px]"
            >
              <Picker
                onEmojiClick={(emojiObject) => {
                  setMessage((prev) => prev + emojiObject.emoji);
                  setShowImozi(false);
                }}
              />
            </div>
          )}

          <textarea
            type="text"
            value={message}
            onChange={(e) => handleMessage(e)}
            placeholder="Type a message..."
            rows={1}
            className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none overflow-y-auto"
          />
          <button
            onClick={() => setShowImozi(true)}
            className="p-1.5 absolute right-3 text-gray-400 hover:bg-gray-600/10 rounded-md transition-colors"
          >
            <LuSmilePlus size={20} />
          </button>
        </div>
        <button
          onClick={() => handleSendMessage()}
          disabled={!message}
          className={`px-[15px] py-2 text-white ${
            message ? "bg-[#574CD6]" : "bg-[#948cee] cursor-default "
          }   rounded-full`}
        >
          <IoSend />
        </button>
      </div>
    </div>
  );
};

export default InputBox;
