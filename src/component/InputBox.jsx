import React, { useEffect, useRef, useState } from "react";
import TypingIndicator from "../component/TypingIndicator";
import { LuSmilePlus } from "react-icons/lu";
import { ImAttachment } from "react-icons/im";
import { FiImage } from "react-icons/fi";
import { LuSendHorizontal } from "react-icons/lu";
import { RiVideoFill } from "react-icons/ri";
import { AiOutlineFile } from "react-icons/ai";
import { SlPicture } from "react-icons/sl";
import { RxCross1 } from "react-icons/rx";
import { LuLoaderCircle } from "react-icons/lu";
import { getdefaultProfile } from "../helper/filePre";
import { getDate } from "../helper/getDate";
import ImojiPiker from "./ImojiPiker";
import { getGroupMemberName } from "../helper/chatPageHelper";

const InputBox = ({
  typingUserId,
  typingInfo,
  logedInUser,
  groupMembers,
  selectedUser,
  setMessage,
  message,
  handleMessage,
  handleSendMessage,
  setShowImozi,
  showImozi,
  selectedFiles,
  setSelectedFiles,
  loading,
  replyTomessage,
  setReplyToMessage,
}) => {
  const [fileLimitError, setFileLimitError] = useState(false);
  const imoziPickerRef = useRef(null);
  const textRef = useRef(null);
  const mediaRef = useRef(null);
  const fileRef = useRef(null);
  const fileErrorRef = useRef(null);
  const fileBottomRef = useRef(null);
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
      textRef.current.style.height = "45px";
      return;
    }
    textRef.current.style.height = "auto";
    textRef.current.style.height = `${textRef.current.scrollHeight}px`;
  }, [message]);
  useEffect(() => {
    if (selectedFiles.length === 0 || !fileBottomRef.current) return;

    fileBottomRef.current.scrollTop = fileBottomRef.current.scrollHeight;
  }, [selectedFiles]);
  const handleImages = (e) => {
    const arrayFile = Array.from(e.target?.files);
    setSelectedFiles((prev) => [...prev, ...arrayFile]);
  };

  const handleFiles = (e) => {
    const arrayFile = Array.from(e.target?.files);
    setSelectedFiles((prev) => [...prev, ...arrayFile]);
  };
  useEffect(() => {
    if (selectedFiles?.length > 10 && fileLimitError === false) {
      setFileLimitError(true);
    }
  }, [selectedFiles, fileLimitError]);

  useEffect(() => {
    if (fileErrorRef?.current) {
      setTimeout(() => {
        setFileLimitError(false);
      }, [3000]);
    }
  }, [fileLimitError]);

  const groupKey =
    selectedUser?.type === "group" &&
    `group_${selectedUser?.id?.split("-")[1]}`;

  const typingUsers =
    typingInfo[groupKey]?.filter(
      (u) =>
        u.receiverId === logedInUser?.id &&
        Number(u.groupId) === Number(selectedUser?.id?.split("-")[1]),
    ) || [];
  return (
    <div className="items-center">
      {selectedUser?.type === "group" && typingUsers?.length > 0 && (
        <div className="flex gap-1 items-center pb-[10px] md:pb-[2px] opacity-100">
          {typingUsers?.map((u) => {
            const memeber = groupMembers?.find(
              (m) => m?.user?.id === u?.senderId,
            );
            return memeber?.u?.image && memeber?.u?.image.trim() !== "" ? (
              <img
                src={memeber?.user?.image}
                alt="User"
                className="w-6 3xl:w-10 h-6 3xl:h-10 rounded-full object-cover ring-2 ring-gray-50"
              />
            ) : (
              <div className="hidden md:flex w-8 3xl:w-10 h-8 3xl:h-10 rounded-full bg-indigo-50 items-center justify-center text-[#574CD6] font-bold border border-indigo-100">
                {getdefaultProfile(memeber?.user?.name)}
              </div>
            );
          })}

          <TypingIndicator />
        </div>
      )}

      {typingInfo?.[`chat_${selectedUser?.id}`]?.type === "chat" &&
        typingUserId[`chat_${selectedUser?.id}`] && (
          <div className=" pb-[10px] md:pb-[2px] opacity-100 flex gap-1">
            {selectedUser?.image ? (
              <img
                src={selectedUser.image}
                alt="User"
                className="w-6 3xl:w-10 h-6 3xl:h-10 rounded-full object-cover ring-2 ring-gray-50"
              />
            ) : (
              <div className="hidden md:flex w-8 3xl:w-10 h-8 3xl:h-10 rounded-full bg-indigo-50 items-center justify-center text-[#574CD6] font-bold border border-indigo-100">
                {getdefaultProfile(selectedUser.name)}
              </div>
            )}
            <TypingIndicator />
          </div>
        )}
      <div className="flex gap-2 items-center w-full border">
        <div
          className="relative  w-full rounded-xl border-[1px] bg-white border-gray-300 focus-within:border-b-2 2xl:focus-within:border-b-4 focus-within:border-b-[#786FDD]"
          onClick={() => textRef.current?.focus()}
        >
          <div
            ref={fileErrorRef}
            className={`px-2 z-10 py-1 3xl:py-2 text-sm 2xl:text-base 3xl:text-lg flex items-center justify-between w-full text-red-800 absolute top-[-19px] 2xl:top-[-28px] 3xl:top-[-34px] bg-red-200 rounded-tl-xl rounded-tr-xl font-semibold ${
              fileLimitError
                ? "opacity-100 duration-700"
                : "opacity-0 duration-700"
            }`}
          >
            <p className="">Up to 10 files can't be uploaded at a time</p>
            <button onClick={() => setFileLimitError(false)}>
              <RxCross1 />
            </button>
          </div>
          {replyTomessage && (
            <div className="p-2 bg-[#574CD6] rounded-lg w-full max-w-[250px] sm:max-w-[400px] mx-3 mt-3 text-white text-xs">
              <div className="w-full flex justify-between">
                {" "}
                <div className="flex gap-2">
                  <p>
                    {selectedUser?.type === "group"
                      ? getGroupMemberName({
                          msg: replyTomessage,
                          groupMembers,
                        })
                      : selectedUser?.name}
                  </p>{" "}
                  <p className="text-gray-300">
                    {getDate(replyTomessage?.createdAt)}
                  </p>
                </div>{" "}
                <button
                  onClick={() => setReplyToMessage(null)}
                  className=" rounded-full  transition-colors"
                  title="Remove referance"
                >
                  <RxCross1 />
                </button>
              </div>

              <div className="mt-1 truncate">
                {" "}
                {replyTomessage?.text && replyTomessage?.text.trim() !== "" && (
                  <p
                    className={`${
                      replyTomessage?.file?.length === 0
                        ? "overflow-hidden text-ellipsis line-clamp-2"
                        : ""
                    }`}
                  >
                    {replyTomessage?.text}
                  </p>
                )}
                {replyTomessage?.file && replyTomessage?.file.length > 0 && (
                  <div className="flex gap-1 items-center truncate">
                    {replyTomessage?.file.map((file) => (
                      <p className="flex gap-1 items-center">
                        {file?.fileType?.startsWith("image/") && <SlPicture />}
                        {file?.fileType?.startsWith("video/") && (
                          <RiVideoFill />
                        )}
                        {!file.fileType?.startsWith("video/") &&
                          !file.fileType?.startsWith("image/") && (
                            <AiOutlineFile />
                          )}
                        {file?.fileName}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedFiles.length > 0 && (
            <>
              {" "}
              <div
                ref={fileBottomRef}
                className="flex gap-3 flex-wrap p-3 max-h-24 overflow-y-auto"
              >
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative flex items-center gap-3 w-64 p-2 bg-white border border-[#574CD6]rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 text-[#574CD6] shrink-0">
                      {file.type.startsWith("image/") && (
                        <SlPicture size={20} />
                      )}
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
                          prev.filter((_, i) => i !== index),
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
            </>
          )}
          <textarea
            ref={textRef}
            type="text"
            value={message}
            onChange={(e) => handleMessage(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            // rows={0.5}
            // cols={1}
            className="flex-1 w-full text-sm 2xl:text-base 3xl:text-xl hide-scrollbar rounded-xl px-3 pt-3  resize-none focus:outline-none max-h-[200px] overflow-y-auto"
          />{" "}
          <div className="flex gap-3 3xl:gap-5 px-3 pb-3 items-center justify-end w-full relative text-lg xl:text-xl 3xl:text-3xl">
            <div
              ref={imoziPickerRef}
              className="absolute right-3 sm:right-[70px] bottom-[45px] x z-[11]"
              // style={{}}
            >
              <ImojiPiker
                showImozi={showImozi}
                setShowImozi={setShowImozi}
                setMessage={setMessage}
              />
            </div>

            <button
              onClick={() => setShowImozi(true)}
              title="Emoji's "
              type="file"
              accept="image/*"
              className=" text-gray-400 rounded-md transition-colors hover:text-[#554AD1]"
            >
              <LuSmilePlus />
            </button>
            {/* media ref */}
            <button
              title="Attach media"
              onClick={() => mediaRef?.current.click()}
              className=" text-gray-400  rounded-md transition-colors hover:text-[#554AD1]"
            >
              <FiImage />
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
              <ImAttachment />
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
              disabled={
                (message?.trim() === "" &&
                  (selectedFiles.length === 0 || selectedFiles?.length > 10)) ||
                loading
              }
              accept="image/*"
              className={`${
                (message?.trim() === "" &&
                  (selectedFiles.length === 0 || selectedFiles?.length > 10)) ||
                loading
                  ? "cursor-default"
                  : "cursor-pointer"
              } text-gray-400 rounded-md transition-colors hover:text-[#554AD1]`}
            >
              {loading ? (
                <p className="text-[#554AD1] text-2xl font-bold animate-spin">
                  <LuLoaderCircle />
                </p>
              ) : (
                <LuSendHorizontal />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBox;
