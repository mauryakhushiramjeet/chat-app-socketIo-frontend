import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllFriends } from "../store/actions/userActions";
import io from "socket.io-client";
import { getAllMesages } from "../store/actions/messageActions";
import Sidebar from "../component/Sidebar";
import { LuSmilePlus } from "react-icons/lu";
import { HiOutlinePencil, HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiArrowUturnLeft } from "react-icons/hi2";
import DeleteModel from "../component/DeleteModel";
import InputBox from "../component/InputBox";
import { FaCheck } from "react-icons/fa";

const ChatPage = () => {
  // --- ALL LOGIC KEPT EXACTLY THE SAME ---
  const [logedInUser, setLogedInUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [showImozi, setShowImozi] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const selectedUserRef = React.useRef(null);
  const dispatch = useDispatch();
  const messageStore = useSelector((store) => store.messages);
  const messageRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: "",
      text: "",
      receiverId: "",
      senderId: "",
      createdAt: "",
      deletedByMeId: null,
      deletedForAll: false,
    },
  ]);

  useEffect(() => {
    const newSocket = io("http://localhost:8085");
    setSocket(newSocket);
    newSocket.emit("online-users", logedInUser?.id);
    newSocket.on("online-users", (onlineUsers) => {
      onlineUsers.map((id) =>
        setOnlineUsers((prev) => {
          const userIdAlredy = prev.includes(id);
          if (!userIdAlredy) {
            return [...prev, id];
          } else return prev;
        })
      );
    });
    newSocket.on("user-disconnected", (userId) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => String(id) !== String(userId))
      );
    });
    newSocket.on("userTyping", ({ senderId, receiverId }) => {
      const currentSelectedUser = selectedUserRef.current;
      if (!currentSelectedUser) return;
      if (senderId !== currentSelectedUser.id) return;
      if (receiverId !== logedInUser?.id) return;
      setTypingUserId(senderId);
    });
    newSocket.on("userStopTyping", ({ senderId, receiverId }) => {
      const currentSelectedUser = selectedUserRef.current;
      if (!currentSelectedUser) return;
      if (
        senderId === currentSelectedUser.id &&
        receiverId === logedInUser?.id
      ) {
        setTypingUserId(null);
      }
    });
    newSocket.on("newMessage", ({ response }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: response?.id,
          text: response?.text,
          receiverId: response?.receiverId,
          senderId: response?.senderId,
          createdAt: response?.createdAt,
          deletedByMeId: null,
          deletedForAll: false,
        },
      ]);
    });
    newSocket.on("message:deleted", ({ messageId, type }) => {
      if (type === "FOR_EVERYONE") {
        console.log("deleted for evryOne signale is geted from socket ");
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg?.id === messageId) {
              return { ...msg, text: null };
            }
            return msg;
          });
        });
      }
      if (type === "FOR_ME") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, deletedByMeId: logedInUser?.id }
              : msg
          )
        );
      }
      setIsModelOpen(false);
    });
    return () => newSocket.disconnect();
  }, [logedInUser?.id]);

  const getdefaultProfile = (name) => {
    if (!name) return;
    const spiltName = name.split(" ");
    return spiltName.length > 1
      ? `${spiltName[0][0]}${spiltName[1][0]}`
      : `${spiltName[0][0]}`;
  };

  useEffect(() => {
    if (!socket || !logedInUser?.id || !selectedUser?.id) return;
    dispatch(
      getAllMesages({ senderId: logedInUser.id, receiverId: selectedUser.id })
    );
  }, [socket, logedInUser, selectedUser, dispatch]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    setLogedInUser(user);
  }, []);

  useEffect(() => {
    if (logedInUser?.id) dispatch(getAllFriends(logedInUser.id));
  }, [logedInUser, dispatch]);

  useEffect(() => {
    if (!socket || !logedInUser?.id || !selectedUser?.id) return;
    socket.emit("joinRoom", {
      senderId: logedInUser.id,
      receiverId: selectedUser.id,
    });
  }, [socket, logedInUser, selectedUser]);

  const handleMessage = (e) => {
    setMessage(e.target.value);
    if (e.target.value) {
      socket.emit("typing", {
        senderId: logedInUser?.id,
        receiverId: selectedUser?.id,
      });
    } else {
      setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: logedInUser?.id,
          receiverId: selectedUser?.id,
        });
      }, 1000);
    }
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("sendMessage", {
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      text: message,
    });
    setMessage("");
    socket.emit("stopTyping", {
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
    });
  };

  const getDate = (date) => {
    const now = new Date(date);
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
  };

  useEffect(() => {
    if (messageStore?.messages.length === 0) return;
    setMessages(messageStore?.messages);
  }, [messageStore]);

  useEffect(() => {
    if (messageRef.current)
      messageRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteForMe = () => {
    setIsModelOpen(false);
    socket.emit("message:delete", {
      messageId: deleteMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_ME",
    });
  };

  const handleDeleteFoEveryOne = () => {
    setIsModelOpen(false);
    socket.emit("message:delete", {
      messageId: deleteMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_EVERYONE",
    });
    setDeleteMessageId(null);
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      {/* Sidebar - Added a subtle border-right */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white">
        <Sidebar
          logedInUser={logedInUser}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          socket={socket}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Chat Area - Clean white background with flex-column */}
      <div className="flex-1 flex flex-col relative bg-white">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <LuSmilePlus size={40} className="text-gray-300" />
            </div>
            <h1 className="text-xl font-semibold text-gray-600">
              Select a Conversation
            </h1>
            <p className="text-sm">
              Pick a friend from the sidebar to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header - Glassmorphism style */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedUser?.image && selectedUser.image.trim() !== "" ? (
                    <img
                      src={selectedUser.image}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#574CD6] font-bold border border-indigo-100">
                      {getdefaultProfile(selectedUser?.name)}
                    </div>
                  )}
                  {onlineUsers.includes(String(selectedUser?.id)) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-800 leading-tight">
                    {selectedUser.name}
                  </div>
                  <div className="text-[11px] text-green-600 font-medium">
                    {onlineUsers.includes(String(selectedUser?.id)) ? (
                      ""
                    ) : selectedUser?.LastActiveAt ? (
                      <p className="text-[#574CD6] text-xs">
                        Last seen {getDate(selectedUser?.LastActiveAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <HiOutlineDotsHorizontal size={20} />
              </button>
            </div>

            {/* Messages Area - Subtle background color change */}
            <div className="flex-1 px-6 py-4 overflow-y-auto bg-[#F9FAFB] space-y-4">
              {(messages || []).map((msg, idx) => {
                const isChatMessage =
                  (msg.senderId === logedInUser?.id &&
                    msg.receiverId === selectedUser?.id) ||
                  (msg.senderId === selectedUser?.id &&
                    msg.receiverId === logedInUser?.id);

                if (!isChatMessage || msg?.deletedByMeId === logedInUser?.id)
                  return null;

                const isMe = msg.senderId === logedInUser?.id;

                return (
                  <div
                    key={idx}
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[70%] relative group">
                      <div
                        className={`absolute ${
                          msg.text === null ? "hidden" : "block"
                        } -top-8 ${
                          isMe ? "right-0" : "left-0"
                        } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center bg-white border border-gray-100 rounded-lg shadow-xl px-1 py-0.5 z-10`}
                      >
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors">
                          <LuSmilePlus size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors">
                          <HiOutlinePencil size={16} />
                        </button>
                        {isMe && (
                          <button
                            onClick={() => {
                              setIsModelOpen(true);
                              setDeleteMessageId(msg?.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                          >
                            <RiDeleteBinLine size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors">
                          <HiArrowUturnLeft size={16} />
                        </button>
                      </div>

                      {/* Bubble Styling - Added specific corner rounding for sent/received */}
                      <div className="flex gap-1">
                        <div className={`${!isMe ? "block" : "hidden"}`}>
                          {" "}
                          {selectedUser?.image &&
                          selectedUser.image.trim() !== "" ? (
                            <img
                              src={selectedUser.image}
                              alt="User"
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-50"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[#574CD6] font-bold border border-indigo-100">
                              {getdefaultProfile(selectedUser?.name)}
                            </div>
                          )}
                        </div>
                        <div
                          className={`px-4 py-2.5 shadow-sm text-sm leading-relaxed w-full max-w-[400px]  ${
                            isMe
                              ? ` ${
                                  msg.text === null
                                    ? "bg-[#574CD6]/80"
                                    : "bg-[#574CD6]"
                                }  text-white rounded-2xl rounded-tr-none`
                              : "bg-gray-200 text-gray-800 rounded-2xl rounded-tl-none border border-gray-100 break-words "
                          }`}
                        >
                          {msg.text === null
                            ? "This mesage was deleted"
                            : msg.text}
                          <div
                            className={`text-[10px] mt-1 flex items-center gap-1 ${
                              isMe
                                ? "text-indigo-100 justify-end"
                                : "text-gray-400"
                            }`}
                          >
                            {getDate(msg?.createdAt)}
                            {isMe && <FaCheck size={8} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messageRef} className="h-2"></div>
            </div>

            {/* Input Wrapper - Clean Padding */}
            <div className="px-12 py-4 bg-white border-t border-gray-100">
              <InputBox
                typingUserId={typingUserId}
                selectedUser={selectedUser}
                setMessage={setMessage}
                message={message}
                handleMessage={handleMessage}
                handleSendMessage={handleSendMessage}
                setShowImozi={setShowImozi}
                showImozi={showImozi}
              />
            </div>
          </>
        )}
      </div>

      <DeleteModel
        onCancel={() => setIsModelOpen(false)}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteFoEveryOne}
        isModelOpen={isModelOpen}
        setIsModelOpen={setIsModelOpen}
      />
    </div>
  );
};

export default ChatPage;
