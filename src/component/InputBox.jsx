import React, { useEffect, useRef, useState } from "react";
import TypingIndicator from "../component/TypingIndicator";
import { IoSend } from "react-icons/io5";
import Picker from "emoji-picker-react";
import { LuSmilePlus } from "react-icons/lu";
import { ImAttachment } from "react-icons/im";
import { FiImage } from "react-icons/fi";
import { LuSendHorizontal } from "react-icons/lu";
import { RiVideoFill } from "react-icons/ri";
import { AiOutlineFile } from "react-icons/ai";
import { SlPicture } from "react-icons/sl";
import { RxCross1 } from "react-icons/rx";

const InputBox = ({
  typingUserId,
  selectedUser,
  setMessage,
  message,
  handleMessage,
  handleSendMessage,
  setShowImozi,
  showImozi,
  selectedFiles,
   setSelectedFiles
}) => {
  const imoziPickerRef = useRef(null);
  const textRef = useRef(null);
  const mediaRef = useRef(null);
  const fileRef = useRef(null);

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

  useEffect(() => {
    if (!textRef.current) return;

    if (message.trim() === "") {
      textRef.current.style.height = "40px";
      return;
    }
    textRef.current.style.height = "auto";
    textRef.current.style.height = `${textRef.current.scrollHeight}px`;
  }, [message]);
  useEffect(() => {
    if (selectedFiles.length === 0) return;
  }, [selectedFiles]);
  const handleImages = (e) => {
    console.log(e.target?.files[0], "this file");
    const file = e.target?.files[0];
    const url = URL.createObjectURL(file);
    const arrayFile = Array.from(e.target?.files);
    setSelectedFiles((prev) => [...prev, ...arrayFile]);
  };

  const handleFiles = (e) => {
    console.log(e.target?.files[0], "this file");
    const file = e.target?.files;
    const arrayFile = Array.from(e.target?.files);
    setSelectedFiles((prev) => [...prev, ...arrayFile]);
    console.log(file);
    // const url = URL.createObjectURL(file);
  };
  console.log(selectedFiles);
  return (
    <div className="">
      {typingUserId === selectedUser?.id && (
        <div className="flex gap-1 items-center pb-[2px]">
          <img
            src={selectedUser?.image}
            alt="selected-user"
            className="h-6 w-6 rounded-full object-contain"
          />
          <TypingIndicator />
        </div>
      )}
      <div className="flex gap-2 items-center">
        <div
          className="relative  w-full rounded-xl border-[1px] border-gray-300  focus-within:border-b-2 focus-within:border-b-[#786FDD]"
          onClick={() => textRef.current?.focus()}
        >
          {selectedFiles.length > 0 && (
            <div className="flex gap-3 flex-wrap p-3 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-3 w-64 p-2 bg-white border border-[#574CD6]rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Icon Container */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 text-[#574CD6] shrink-0">
                    {file.type.startsWith("image/") && <SlPicture size={20} />}
                    {file.type.startsWith("video/") && (
                      <RiVideoFill size={20} />
                    )}
                    {!file.type.startsWith("video/") &&
                      !file.type.startsWith("image/") && (
                        <AiOutlineFile size={20} />
                      )}
                  </div>

                  {/* File Details */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {(file.size / 1024).toFixed(1)} KB • Ready to send
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="p-1.5 rounded-full text-gray-400 hover:bg-[#574CD6]/10 hover:text-[#574CD6] transition-colors"
                    title="Remove file"
                  >
                    <RxCross1 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textRef}
            type="text"
            value={message}
            onChange={(e) => handleMessage(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={0.5}
            // cols={1}
            className="w-full hide-scrollbar rounded-xl px-3 pt-3  resize-none focus:outline-none max-h-[200px] overflow-y-auto"
          />{" "}
          <div className="flex gap-3 px-3 pb-3 items-center justify-end w-full relative">
            {showImozi && (
              <div
                ref={imoziPickerRef}
                className="absolute right-[70px] bottom-[45px]"
              >
                <Picker
                  onEmojiClick={(emojiObject) => {
                    setMessage((prev) => prev + emojiObject.emoji);
                    setShowImozi(false);
                  }}
                />
              </div>
            )}
            <button
              onClick={() => setShowImozi(true)}
              title="Emoji's "
              type="file"
              accept="image/*"
              className=" text-gray-400 rounded-md transition-colors hover:text-[#554AD1]"
            >
              <LuSmilePlus size={20} />
            </button>
            {/* media ref */}
            <button
              title="Attach media"
              onClick={() => mediaRef?.current.click()}
              className=" text-gray-400  rounded-md transition-colors hover:text-[#554AD1]"
            >
              <FiImage size={20} />
            </button>
            <input
              type="file"
              ref={mediaRef}
              onChange={(e) => handleImages(e)}
              className="hidden"
              accept="image/*,video/*"
            />
            {/* file ref */}
            <button
              title=" Attach File "
              type="file"
              onClick={() => fileRef?.current.click()}
              accept="image/*"
              className=" text-gray-400 rounded-md transition-colors hover:text-[#554AD1]"
            >
              <ImAttachment size={20} />
            </button>
            <input
              type="file"
              ref={fileRef}
              onChange={(e) => handleFiles(e)}
              className="hidden"
              // accept="image/*"
            />
            <button
              title="Send"
              type="file"
              onClick={() => handleSendMessage()}
              disabled={!message || message.trim() === ""}
              accept="image/*"
              className=" text-gray-400 cursor-pointer rounded-md transition-colors hover:text-[#554AD1]"
            >
              <LuSendHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBox;
