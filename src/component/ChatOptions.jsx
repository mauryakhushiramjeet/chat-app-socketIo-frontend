import React, { useContext, useEffect, useRef } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { RiUserLine } from "react-icons/ri";
import { ProfileContext } from "../utills/context/ProfileContext";

const ChatOptions = ({
  open,
  setShowChatOptions,
  loggedUser,
  selectedUser,
  socket,
  messages,
}) => {
  const optionsRef = useRef(null);
  const { setShowProfile } = useContext(ProfileContext);

  useEffect(() => {
    const toggleOption = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowChatOptions(false);
      }
    };
    window.addEventListener("mousedown", toggleOption);
    return () => window.removeEventListener("mousedown", toggleOption);
  }, []);
  const handleClearChat = () => {
    // if()
    if (messages?.length === 0) {
      setShowChatOptions(false);
      return;
    }
    console.log("is it workin ");

    console.log(
      {
        senderId: loggedUser?.id,
        receiverId: selectedUser?.id,
        type: selectedUser?.type,
        groupId:
          selectedUser?.type === "chat"
            ? null
            : Number(selectedUser.id.split("-")[1]),
      },
      "users id",
    );
    socket.emit("clearChat", {
      senderId: loggedUser?.id,
      receiverId: selectedUser?.id,
      type: selectedUser?.type,
      groupId:
        selectedUser?.type === "chat"
          ? null
          : Number(selectedUser.id.split("-")[1]),
      sidebarChatId: selectedUser?.mainId,
    });
    //   socket.emit("clearChat_for_sidebarUpadate", {
    //   senderId: loggedUser?.id,
    //   receiverId: selectedUser?.id,
    //   type: selectedUser?.type,
    //   groupId:
    //     selectedUser?.type === "chat"
    //       ? null
    //       : Number(selectedUser.id.split("-")[1]),
    // });
  };
  if (!open) return;
  return (
    <div
      ref={optionsRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <button
        onClick={() => handleClearChat()}
        className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
      >
        <RiDeleteBinLine
          size={18}
          className="text-gray-400 group-hover:text-[#5449cf]"
        />
        <span className="font-medium ">Clear chat</span>
      </button>

      {/* You can easily add more options here later */}

      <button
        onClick={() => {
          setShowProfile(true);
          setShowChatOptions(false);
        }}
        className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50"
      >
        <RiUserLine
          size={18}
          className="text-gray-400 group-hover:text-[#5449cf]"
        />
        <span className="font-medium">View Profile</span>
      </button>
    </div>
  );
};

export default ChatOptions;
