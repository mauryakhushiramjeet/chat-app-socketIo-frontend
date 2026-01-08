import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllFriends } from "../store/actions/userActions";
import io from "socket.io-client";
import {
  getAllReceiverMesages,
  getAllMessages,
  getGroupMessages,
} from "../store/actions/messageActions";
import Sidebar from "../component/Sidebar";
import { LuSmilePlus } from "react-icons/lu";
import { HiOutlinePencil, HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiArrowUturnLeft } from "react-icons/hi2";
import DeleteModel from "../component/DeleteModel";
import InputBox from "../component/InputBox";
import { IoCheckmark, IoCheckmarkDone, IoTimeOutline } from "react-icons/io5";
import EditMessageArea from "../component/EditMessageArea ";

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
  const [editMessageId, setEditMessageId] = useState(null);
  const [editedMessage, setEditedMesage] = useState("");
  const [allReceiverMessages, setAllReceiverMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const selectedUserRef = React.useRef(null);
  const onlineUserRef = React.useRef(null);
  const deleteMessageIdRef = React.useRef(null);
  const messagesRef = useRef([]);

  const dispatch = useDispatch();
  const messageStore = useSelector((store) => store.messages);
  const receiverMessageStore = useSelector((store) => store.getMyMessages);
  const groupMessageStore = useSelector((store) => store.groupMessages);
  const messageRef = useRef(null);

  useEffect(() => {
    if (!logedInUser) return;
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
    newSocket.on("editMessage:error", ({ message }) => {
      setEditMessageId(null);
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
    newSocket.on("status:send", ({ clientMessageId }) => {
      setPrivateMessages((prev) =>
        prev.map((msg) =>
          msg.clientMessageId === clientMessageId
            ? { ...msg, status: "Send" }
            : msg
        )
      );
    });
    newSocket.on("editMessage", ({ messageId, newText, chatType }) => {
      if (chatType === "chat") {
        setPrivateMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, text: newText } : msg
          )
        );
      } else {
        setGroupMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, text: newText } : msg
          )
        );
      }

      setEditMessageId(null);
    });
    newSocket.on("newMessage", ({ clientMessageId, response }) => {
      const currentSelectedUser = selectedUserRef.current;

      setPrivateMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.clientMessageId === clientMessageId
            ? { ...response, status: "Send" }
            : msg
        );

        const exist = updated.some((m) => m.id === response.id);
        if (!exist) {
          return [...updated, { ...response, status: "Send" }];
        }

        return updated;
      });
      const currentOnlineUser = onlineUserRef.current;
      const recieverSocketId = currentOnlineUser.includes(
        String(logedInUser?.id)
      );

      if (response?.receiverId === logedInUser?.id && recieverSocketId) {
        if (currentSelectedUser?.id === response?.senderId) {
          newSocket.emit("status:Read", { messageId: response?.id });
        } else {
          newSocket.emit("status:delivered", { messageId: response?.id });
        }
      }
    });
    newSocket.on("status:Read", ({ messageId }) => {
      setPrivateMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "Read" } : msg
        )
      );
    });
    newSocket.on("status:delivered", ({ messageId }) => {
      setPrivateMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "Delivered" } : msg
        )
      );
    });

    newSocket.on("message:deleted", ({ messageId, type, chatType }) => {
      console.log("get delete sinal at frontend");
      const curtrentSelectedUser = selectedUserRef.current;
      const currentDeletedMessageId = deleteMessageIdRef.current;
      const currentMessages = messagesRef.current;
      console.log("before", curtrentSelectedUser.type);

      if (type === "FOR_EVERYONE") {
        if (chatType === "group") {
          setGroupMessages((prev) => {
            return prev.map((msg) => {
              if (msg?.id === messageId) {
                return { ...msg, text: null };
              }
              return msg;
            });
          });
        } else {
          setPrivateMessages((prev) => {
            return prev.map((msg) => {
              if (msg?.id === messageId) {
                return { ...msg, text: null };
              }
              return msg;
            });
          });
        }
        // setDeleteMessageId(null);
      }
      if (type === "FOR_ME") {
        if (chatType === "group") {
          setGroupMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, deletedByMeId: logedInUser?.id }
                : msg
            )
          );
        } else {
          setPrivateMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, deletedByMeId: logedInUser?.id }
                : msg
            )
          );
        }
      }
      console.log("before update");
      if (isLastMessageDeleted(currentDeletedMessageId, currentMessages)) {
        console.log("upddate signal client-server", currentDeletedMessageId);
        console.log(curtrentSelectedUser, "selected uset");
        newSocket.emit("sidebar:update", {
          chatType: curtrentSelectedUser?.type,
          senderId: logedInUser?.id,
          receiverId: curtrentSelectedUser?.id,
          messageId: currentDeletedMessageId,
          chatListId: curtrentSelectedUser?.mainId,
        });
      }
      setIsModelOpen(false);
    });
    newSocket.on("receiveGropMessage", (data) => {
      setGroupMessages((prevMessages) => {
        const currentSelectedUser = selectedUserRef.current;
        if (currentSelectedUser?.id !== data?.groupId) return;

        const exists = prevMessages.some(
          (msg) => msg.id === data.lastMessageId
        );
        if (exists) return prevMessages;
       
        return [
          ...prevMessages,
          {
            id: data.messageId,
            text: data.message,
            groupId: data.groupId.split("-")[1],
            createdAt: new Date(),
            sender: data.sender,
            status: "Delivered",
            userId: data.sender.id,
          },
        ];
      });
    });

    return () => newSocket.disconnect();
  }, [logedInUser?.id]);
  console.log();
  const messages = useMemo(() => {
    if (selectedUser?.type === "group") {
      return groupMessages;
    } else {
      return privateMessages;
    }
  }, [selectedUser?.type, privateMessages, groupMessages]);
  useEffect(() => {
    messagesRef.current = messages; // messages from useMemo
  }, [messages]);

  const getdefaultProfile = (name) => {
    if (!name) return;
    const spiltName = name.split(" ");
    return spiltName.length > 1
      ? `${spiltName[0][0]}${spiltName[1][0]}`
      : `${spiltName[0][0]}`;
  };
  useEffect(() => {
    onlineUserRef.current = onlineUsers;
  }, [onlineUsers]);
  // console.log(messages, "mesages");
  useEffect(() => {
    if (!socket || !logedInUser?.id) return;
    if (!messages || messages.length === 0) return;
    const unDeliveredMessages = messages.filter(
      (msg) =>
        msg.receiverId === logedInUser.id &&
        msg?.status === "Send" &&
        msg.senderId !== selectedUser?.id
    );
    if (
      onlineUsers.includes(String(logedInUser.id)) &&
      unDeliveredMessages.length > 0
    ) {
      unDeliveredMessages.forEach((msg) => {
        socket.emit("status:delivered", {
          messageId: msg.id,
        });
      });
    }
    const unReadedMessage = messages.filter(
      (msg) =>
        msg?.receiverId === logedInUser?.id &&
        msg?.senderId === selectedUser?.id &&
        (msg?.status === "Delivered" || msg?.status === "Send") &&
        !msg.readSent
    );
    if (
      unReadedMessage.length > 0 &&
      onlineUsers.includes(String(logedInUser.id))
    ) {
      unReadedMessage.forEach((msg) => {
        socket.emit("status:Read", { messageId: msg?.id });
        msg.readSent = true;
      });
    }
  }, [
    socket,
    logedInUser?.id,
    onlineUsers,
    messageStore,
    messages,
    selectedUser?.id,
  ]);
  useEffect(() => {
    if (!logedInUser?.id || !selectedUser?.id) return;
    if (!selectedUser || selectedUser?.type === "group") return;
    dispatch(
      getAllMessages({
        senderId: logedInUser.id,
        receiverId: selectedUser.id,
      })
    );
  }, [logedInUser?.id, selectedUser?.id, dispatch]);

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
    setEditMessageId(null);
    setMessage("");
    setGroupMembers([]);
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    if (selectedUser?.type === "group") {
      const id = selectedUser?.id;
      const groupId = id.split("-")[1];
      socket.emit("sendGroupMessage", {
        groupId: groupId,
        message,
        messageSenderId: logedInUser?.id,
      });

      setMessage("");
    } else {
      const clientMessageId = crypto.randomUUID();

      socket.emit("sendMessage", {
        clientMessageId,
        senderId: logedInUser?.id,
        receiverId: selectedUser?.id,
        text: message,
        type: selectedUser?.type,
      });
      setPrivateMessages((prev) => {
        return [
          ...prev,
          {
            clientMessageId,
            id: null,
            text: message,
            receiverId: selectedUser?.id,
            senderId: logedInUser.id,
            status: "Pending",
            createdAt: new Date(),
            deletedByMeId: null,
            deletedForAll: false,
          },
        ];
      });

      setMessage("");
      socket.emit("stopTyping", {
        senderId: logedInUser?.id,
        receiverId: selectedUser?.id,
      });
    }
  };
  useEffect(() => {
    if (!logedInUser?.id) return;
    if (!onlineUsers.includes(String(logedInUser?.id)) || selectedUser) return;
    const receiverId = logedInUser?.id;
    dispatch(getAllReceiverMesages({ receiverId }));
  }, [logedInUser?.id, dispatch, messages, onlineUsers]);

  useEffect(() => {
    if (
      !receiverMessageStore.isError &&
      !receiverMessageStore.isLoading &&
      receiverMessageStore?.messages
    ) {
      setAllReceiverMessages(receiverMessageStore?.messages);
    }
  }, [receiverMessageStore]);
  useEffect(() => {
    if (
      groupMessageStore?.isError ||
      groupMessageStore?.isLoading ||
      !groupMessageStore?.messages
    )
      return;
    // console.log(groupMessageStore, "groupit iskljh");
    setGroupMessages(groupMessageStore?.messages);
    setGroupMembers(groupMessageStore?.members);
  }, [groupMessageStore]);
  useEffect(() => {
    if (!socket || !logedInUser?.id) return;
    if (allReceiverMessages.length === 0 || !allReceiverMessages) return;
    allReceiverMessages.forEach((msg) => {
      socket.emit("status:delivered", { messageId: msg.id });
    });
  }, [socket, logedInUser?.id, allReceiverMessages]);
  useEffect(() => {
    if (!selectedUser || selectedUser?.type !== "group" || !selectedUser?.id)
      return;
    const id = selectedUser?.id;
    const groupId = id.split("-")[1];
    dispatch(getGroupMessages(groupId));
  }, [selectedUser]);
  // console.log(selectedUserRef.current);
  const getDate = (date) => {
    const now = new Date(date);
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const day = now.getDate().toString();
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
  };

  useEffect(() => {
    if (messageStore?.messages.length === 0) return;
    setPrivateMessages(messageStore?.messages);
  }, [messageStore]);

  useEffect(() => {
    if (messageRef.current)
      messageRef.current.scrollIntoView({ behavior: "auto" });
  }, [messages]);
useEffect(() => {
    deleteMessageIdRef.current = deleteMessageId;
  }, [deleteMessageId]);
  const handleDeleteForMe = () => {
    setIsModelOpen(false);
   const deleteMessageId=deleteMessageIdRef.current
    console.log(deleteMessageId);

    if (!deleteMessageId || !selectedUser) return;
    socket.emit("message:delete", {
      messageId: deleteMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_ME",
      chatType: selectedUser.type,
    });
    console.log("delete function is call");
  };
  
  const isLastMessageDeleted = (messageId, currentMessages) => {
    console.log(currentMessages, "message sis here");
    const selectedUser = selectedUserRef?.current;
    console.log("selectedUser", selectedUser);
    if (!messageId || !currentMessages || currentMessages.length === 0)
      return false;
    const deleteMessage = currentMessages.find((msg) => msg.id === messageId);
    const messages = currentMessages.filter(
      (msg) =>
        msg.deletedByMeId !==
        (selectedUser?.type === "chat"
          ? deleteMessage?.senderId
          : deleteMessage?.userId)
    );

    const lastMessage = messages[messages.length - 1];
    // console.log(deleteMessage, "deleted message", messages, "filterMessages");
    // console.log(lastMessage, "last message this is");
    if (!deleteMessage || !lastMessage) {
      return false;
    }
    return deleteMessage.id === lastMessage.id;
  };

  const handleDeleteFoEveryOne = () => {
    setIsModelOpen(false);
    socket.emit("message:delete", {
      messageId: deleteMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_EVERYONE",
      chatType: selectedUser?.type,
    });

    // setDeleteMessageId(null);
  };
  const MessageStatus = ({ status }) => {
    switch (status) {
      case "Pending":
        return <IoTimeOutline size={13} />;
      case "Send":
        return <IoCheckmark size={15} />;
      case "Delivered":
        return <IoCheckmarkDone size={15} />;
      case "Read":
        return <IoCheckmarkDone className="text-cyan-400" size={15} />;
      default:
        return null;
    }
  };
  const handleMessageEdit = (editText, editMessageId) => {
    console.log(editText, editMessageId);
    setEditMessageId(editMessageId);
    setEditedMesage(editText);
    // setMessage(editText);
  };
  const sendEditMessage = () => {
    socket.emit("editMessage", {
      messageId: editMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      newText: editedMessage,
      type: selectedUser?.type,
    });
    setEditMessageId(null);
    setEditMessageId("");
  };
  // console.log(selectedUser);
  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      {/* Sidebar - Added a subtle border-right */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white">
        <Sidebar
          logedInUser={logedInUser}
          setLogedInUser={setLogedInUser}
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
                  {selectedUser.type === "group" && (
                    <div className="flex gap-1 text-[#574CD6] text-sm mt-1">
                      {groupMembers.map((member) => (
                        <p key={member?.id}>
                          {member.name}{" "}
                          {member === groupMembers[groupMembers.length - 1]
                            ? ""
                            : ","}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <HiOutlineDotsHorizontal size={20} />
              </button>
            </div>

            {/* Messages Area - Subtle background color change */}
            <div className="flex-1 px-6 py-4 overflow-y-auto bg-[#F9FAFB] space-y-4">
              {(messages || []).map((msg) => {
                const isChatMessage =
                  selectedUser?.type === "group"
                    ? Number(msg.groupId) ===
                      Number(selectedUser.id.split("-")[1])
                    : (msg.senderId === logedInUser?.id &&
                        msg.receiverId === selectedUser?.id) ||
                      (msg.senderId === selectedUser?.id &&
                        msg.receiverId === logedInUser?.id);

                if (!isChatMessage || msg?.deletedByMeId === logedInUser?.id)
                  return null;

                const isMe =
                  selectedUser.type === "group"
                    ? msg.userId === logedInUser?.id
                    : msg.senderId === logedInUser?.id;
                const isGroup = selectedUser?.type === "group";

                const avatarImage = isGroup
                  ? msg?.sender?.image
                  : selectedUser?.image;

                const avatarName = isGroup
                  ? msg?.sender?.name
                  : selectedUser?.name;

                const hasImage = avatarImage && avatarImage.trim() !== "";

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative group w-full max-w-[400px]  ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`absolute ${
                          msg.text === null || msg.id === editMessageId
                            ? "hidden"
                            : "block"
                        } -top-8 ${
                          isMe ? "right-0" : "left-0"
                        } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center bg-white border border-gray-100 rounded-lg shadow-xl px-1 py-0.5 z-10`}
                      >
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors">
                          <LuSmilePlus size={16} />
                        </button>
                        <button
                          onClick={() => handleMessageEdit(msg?.text, msg?.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                        >
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

                      <div
                        className={`flex gap-1 w-full ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`${!isMe ? "block shrink-0" : "hidden"}`}
                        >
                          {" "}
                          {hasImage ? (
                            <img
                              src={avatarImage}
                              alt="User"
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-50"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[#574CD6] font-bold border border-indigo-100">
                              {getdefaultProfile(avatarName)}
                            </div>
                          )}
                        </div>
                        {editMessageId !== null && msg.id === editMessageId ? (
                          <EditMessageArea
                            editedMessage={editedMessage}
                            setEditedMessage={setEditedMesage}
                            onCancel={() => {
                              setEditedMesage("");
                              setEditMessageId(null);
                            }}
                            onSave={() => sendEditMessage()}
                          />
                        ) : (
                          <div
                            className={`px-4 py-2 shadow-sm text-sm leading-relaxed w-fit max-w-[400px] break-words ${
                              isMe
                                ? `${
                                    msg.text === null
                                      ? "bg-[#574CD6]/80"
                                      : "bg-[#574CD6]"
                                  } text-white rounded-2xl rounded-tr-none`
                                : "bg-gray-200 text-gray-800 rounded-2xl rounded-tl-none border border-gray-100"
                            }`}
                          >
                            <div
                              className={
                                msg.text === null
                                  ? "italic opacity-70 text-[13px]"
                                  : ""
                              }
                            >
                              {msg.text === null
                                ? "This message was deleted"
                                : msg.text}
                            </div>

                            {/* Footer: Time + Status */}
                            <div
                              className={`text-[10px] mt-1 flex items-center gap-1 ${
                                isMe
                                  ? "text-indigo-100 justify-end"
                                  : "text-gray-500 justify-start"
                              }`}
                            >
                              <span>{getDate(msg?.createdAt)}</span>

                              {/* Status Icons - Only show for messages I sent */}
                              {isMe && (
                                <span className="flex items-center ml-0.5">
                                  <MessageStatus status={msg.status} />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
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
