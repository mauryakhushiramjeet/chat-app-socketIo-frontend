import React, { useEffect, useRef, useState } from "react";
import { RxCross2, RxCross1 } from "react-icons/rx";
import { RiVideoFill } from "react-icons/ri";
import { AiOutlineFile } from "react-icons/ai";
import { SlPicture } from "react-icons/sl";
import { FiImage } from "react-icons/fi";
import { ImAttachment } from "react-icons/im";
import { LuSmilePlus } from "react-icons/lu";
import Picker from "emoji-picker-react";
import { useDispatch } from "react-redux";
import { updateMessageFile } from "../store/actions/messageActions";
import { LuSendHorizontal } from "react-icons/lu";
import { LuLoaderCircle } from "react-icons/lu";

const EditMessageArea = ({
  editedMessage,
  setEditedMessage,
  onCancel,
  onSave,
  // setEditMessageId,
  editMessageId,
  logedInUser,
  socket,
  selectedUser,
}) => {
  const textAreaRef = useRef(null);
  const [file, setFile] = useState([]);
  const [fileLimitError, setFileLimitError] = useState("");
  const [showImozi, setShowImozi] = useState(false);
  const [deletedFileId, setDeletedFileId] = useState([]);
  const [newAddedFiles, setNewAddedFiles] = useState([]);
  const [newEditedText, setNewEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const imoziPickerRef = useRef(null);
  const mediaRef = useRef(null);
  const fileRef = useRef(null);
  const fileErrorRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
    if (editedMessage?.file?.length > 0) {
      setFile(editedMessage?.file);
    }
    if (editedMessage?.editText) {
      setNewEditedText(editedMessage?.editText);
    }
  }, [editedMessage]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        imoziPickerRef.current &&
        !imoziPickerRef.current.contains(e.target)
      ) {
        setShowImozi(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleFiles = (e) => {
    const arrayFile = Array.from(e.target.files);
    if (file.length + arrayFile.length > 10) {
      setFileLimitError("Up to 10 files can't be uploaded at a time");
      return;
    }
    setFile((prev) => [...prev, ...arrayFile]);
    setNewAddedFiles((prev) => [...prev, e.target?.files[0]]);
  };

  const sendEditMessage = () => {
    // socket.emit("editMessage", {
    //   messageId: editMessageId,
    //   senderId: logedInUser?.id,
    //   receiverId: selectedUser?.id,
    //   newText: editedMessage,
    //   type: selectedUser?.type,
    //   file: file?.length > 0 ? file : null,
    // });


    const formData = new FormData();
    if (newEditedText.trim() === "" && file?.length === 0) {
      setFileLimitError("Message can't be empty");
      return;
    }
    setLoading(true);

    formData.append("messageId", editMessageId);
    formData.append("senderId", logedInUser?.id);
    formData.append("receiverId", selectedUser?.id);
    const finalText =
      newEditedText !== "" ? newEditedText : editedMessage?.editText;
    formData.append("newText", finalText);

    for (let i = 0; i < deletedFileId?.length; i++) {
      formData.append("deletedFileId", deletedFileId[i]);
    }

    formData.append("type", selectedUser?.type);
    if (selectedUser?.type === "group") {
      const groupId = Number(selectedUser.id.split("-")[1]);
      formData.append("groupId", groupId);
    }
    formData.append("fileExist", file.length !== 0 ? true : false);
    for (let i = 0; i < newAddedFiles.length; i++) {
      formData.append("file", newAddedFiles[i]);
    }

    dispatch(updateMessageFile(formData))
      .unwrap()
      .then((res) => {
        if (res.success) {
          setLoading(false);
        }
      })
      .catch((error) => {
        // console.log(error);
        setLoading(false);
      });

  };
  useEffect(() => {
    if (fileErrorRef?.current) {
      setTimeout(() => {
        setFileLimitError(false);
      }, [3000]);
    }
  }, [fileLimitError]);
  return (
    <div className="w-full max-w-[240px] xs:max-w-[300px] sm:max-w-[350px] lg:max-w-[500px] xl:max-w-[550px] 2xl:max-w-[700px] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all">
      {fileLimitError && fileLimitError.trim() !== "" && (
        <div
          ref={fileErrorRef}
          className="px-4 py-2 text-xs font-semibold flex items-center justify-between bg-red-100 text-red-700"
        >
          <p>{fileLimitError}</p>
          <button onClick={() => setFileLimitError("")}>
            <RxCross1 />
          </button>
        </div>
      )}

      <div className="max-h-[200px] 2xl:max-h-[250px] overflow-y-auto p-3 hide-scrollbar">
        <textarea
          ref={textAreaRef}
          value={newEditedText}
          onChange={(e) => setNewEditedText(e.target.value)}
          className="w-full bg-transparent text-gray-700 outline-none resize-none text-sm min-h-6 sm:min-h-[45px] block"
          placeholder="Edit your message..."
          autoFocus
        />

        {file?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {file.map((f, index) => (
              <div
                key={index}
                className="relative flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-xl w-full max-w-[250px] sm:max-w-[400px] group shadow-sm"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-[#574CD6] shrink-0">
                  {f?.fileType?.startsWith("image/") ||
                  f?.type?.startsWith("image/") ? (
                    <SlPicture size={16} />
                  ) : f?.fileType?.startsWith("video/") ||
                    f?.type?.startsWith("video/") ? (
                    <RiVideoFill size={16} />
                  ) : (
                    <AiOutlineFile size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {f.name || f.fileName}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-tighter">
                    Ready to update
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile((prev) => prev.filter((_, i) => i !== index));
                    if (f?.id) {
                      setDeletedFileId((prev) => [...prev, f?.id]);
                    }
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <RxCross1 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 border-t border-gray-100 relative">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="relative">
            {showImozi && (
              <div
                ref={imoziPickerRef}
                className="emoji-wrapper absolute bottom-12 left-0 z-50 shadow-2xl"
              >
                <Picker
                  onEmojiClick={(emoji) => {
                    setEditedMessage(editedMessage?.editText + emoji.emoji);
                    setShowImozi(false);
                  }}
                />
              </div>
            )}
            <button
              onClick={() => setShowImozi(true)}
              className="p-2 hover:text-[#574CD6] transition-colors"
            >
              <LuSmilePlus size={20} />
            </button>
          </div>

          <button
            onClick={() => mediaRef.current.click()}
            className="p-2 hover:text-[#574CD6] transition-colors"
          >
            <FiImage size={19} />
          </button>
          <input
            type="file"
            ref={mediaRef}
            onChange={handleFiles}
            className="hidden"
            accept="image/*,video/*"
            multiple
          />

          <button
            onClick={() => fileRef.current.click()}
            className="p-2 hover:text-[#574CD6] transition-colors"
          >
            <ImAttachment size={17} />
          </button>
          <input
            type="file"
            ref={fileRef}
            onChange={handleFiles}
            className="hidden"
            multiple
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
          >
            <RxCross2 size={20} />
          </button>

          <button
            onClick={() => sendEditMessage()}
            className={`${
              loading || (file?.length > 10 && newEditedText?.trim() === "")
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

            {/* <FaCheck size={14} /> */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageArea;
