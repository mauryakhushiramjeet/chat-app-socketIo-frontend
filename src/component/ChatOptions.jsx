import React, { useContext, useEffect, useRef } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { RiUserLine } from "react-icons/ri";
import { ProfileContext } from "../utills/context/ProfileContext";
import { MdBlock } from "react-icons/md";

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
    console.log("clear chat");
    // if()
    if (messages?.length === 0) {
      setShowChatOptions(false);
      return;
    }

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
    setShowChatOptions(false);
  };
  const handleViewProfile = () => {
    console.log("user view");
    setShowProfile(true);
    setShowChatOptions(false);
  };
  const handleBlockUser = () => {
    console.log("user block");
  };
  const chatOptionsButtons = [
    {
      name: "Clear Chat",
      icon: (
        <RiDeleteBinLine
          size={18}
          className="text-gray-400 group-hover:text-[#5449cf]"
        />
      ),
      onClick: handleClearChat,
    },
    {
      name: "View Profile",
      icon: (
        <RiUserLine
          size={18}
          className="text-gray-400 group-hover:text-[#5449cf]"
        />
      ),
      onClick: handleViewProfile,
    },
    {
      name: "Block User",
      icon: (
        <MdBlock size={18} className="text-red-500 group-hover:text-red-800" />
      ),
      onClick: handleBlockUser,
    },
  ];
  if (!open) return;
  return (
    <div
      ref={optionsRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      {chatOptionsButtons.map((btn) => (
        <button
          key={btn.name}
          onClick={btn.onClick}
          className={`group w-full flex items-center gap-3 px-4 py-3 text-sm ${btn.name === "Block User" ? "text-red-500 hover:bg-red-100" : "text-gray-700 hover:bg-gray-50"}  transition-colors`}
        >
          {btn.icon}

          <span className="font-medium">{btn.name}</span>
        </button>
      ))}

      {/* You can easily add more options here later */}
      {/* here also */}
    </div>
  );
};

export default ChatOptions;
