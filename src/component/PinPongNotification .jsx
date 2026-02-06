import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoSend, IoHappyOutline } from "react-icons/io5";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdOutlineMessage } from "react-icons/md";
import Profile from "./Profile";
import { getdefaultProfile } from "../helper/filePre";

const PinPongNotification = ({
  initials = "GG",
  socket,
  selectedUser,
  loggedUser,
}) => {
  const [reply, setReply] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [ntfDetailes, setNtfDetailes] = useState({
    replyToMessageId: null,
    replyMessageSenderId: null,
  });
  const [isHovered, setIsHovered] = useState(false);

  const [notificationUserDetailes, setNotificationUserDetailes] = useState({
    name: "",
    message: "",
    image: "",
    type: "",
    groupName: null,
  });
  const notificationTimeOut = useRef(null);
  const handleSend = (e) => {
    e.preventDefault();
    console.log("Reply sent:", reply);
    setReply("");
  };
  useEffect(() => {
    socket.on(
      "receiveNotification",
      ({
        senderId,
        senderName,
        senderImage,
        message,
        chatType,
        messageId,
        groupId,
        groupName,
      }) => {
        // console.log(
        //   "sender id",
        //   senderId,
        //   "sender name",
        //   senderName,
        //   "image",
        //   senderImage,
        //   "MESSAGE",
        //   message,
        //   "TYPE",
        //   chatType,
        //   "messageiD",
        //   messageId,
        //   "g id",
        //   groupId,
        //   "groupManme",
        //   groupName,
        // );

        const activeChatUserId =
          chatType === "group"
            ? (!selectedUser || Number(selectedUser?.mainId)) ===
              Number(groupId)
            : (!selectedUser || Number(selectedUser?.id)) === Number(senderId);
        console.log(activeChatUserId, "is chat is open");
        if (activeChatUserId) return;
        setNotificationUserDetailes({
          name: senderName,
          message: message,
          image: senderImage,
          type: chatType,
          groupName: chatType === "group" ? groupName : null,
        });
        setNtfDetailes({
          replyMessageSenderId: senderId,
          replyToMessageId: messageId,
        });

        setShowNotification(true);
      },
    );
  }, [socket, selectedUser, loggedUser]);
  useEffect(() => {
    if (!showNotification) return;

    if (isHovered) {
      clearTimeout(notificationTimeOut?.current);
      return;
    }
    notificationTimeOut.current = setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }, [showNotification, isHovered]);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-[120px] right-[-5px]  w-[360px] bg-[#5c55c8] text-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in ${showNotification ? "-translate-x-4 opacity-100" : " opacity-0 translate-x-full"} duration-300`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/10">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-md">
            <MdOutlineMessage className="text-[#5c55c8] text-xs" />
          </div>
          <span className="text-[11px] font-semibold tracking-wide uppercase opacity-90">
            PinPong
          </span>
        </div>
        <div className="flex items-center gap-3">
          <HiDotsHorizontal className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity text-lg" />
          <IoHappyOutline className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity text-lg" />
          <IoClose
            onClick={() => {
              setShowNotification(false);
              console.log("btn click");
            }}
            className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity text-xl"
          />
        </div>
      </div>

      {/* Message Body */}
      <div className="p-4 flex items-start gap-4">
        <Profile
          getdefaultProfile={getdefaultProfile}
          selectedUser={notificationUserDetailes}
        />
        {notificationUserDetailes?.type === "group" ? (
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-bold text-[15px] leading-tight truncate">
              {notificationUserDetailes?.groupName}{" "}
            </h4>
            <p className="text-sm opacity-90 mt-1 line-clamp-2 leading-snug">
              <span className="font-medium">
                {notificationUserDetailes?.name} :{" "}
              </span>
              <span className="text-gray-300">
                {" "}
                {notificationUserDetailes?.message}
              </span>
            </p>
          </div>
        ) : (
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-bold text-[15px] leading-tight truncate">
              {notificationUserDetailes?.name}{" "}
            </h4>
            <p className="text-sm opacity-90 mt-1 line-clamp-2 leading-snug text-gray-300">
              {notificationUserDetailes?.message}
            </p>
          </div>
        )}
      </div>

      {/* Quick Reply Form */}
      <div className="px-4 pb-4">
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Send a quick reply"
            className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border-none rounded-xl py-3 pl-4 pr-12 text-sm placeholder:text-white/50 outline-none transition-all ring-1 ring-white/10 focus:ring-white/30"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <IoSend className="text-lg rotate-[0deg]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinPongNotification;
