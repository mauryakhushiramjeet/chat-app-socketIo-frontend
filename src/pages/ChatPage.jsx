import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllFriends } from "../store/actions/userActions";
import io from "socket.io-client";
import {
  getAllReceiverMesages,
  getAllMessages,
  getGroupMessages,
  sendMessage,
  sendGroupMessage,
} from "../store/actions/messageActions";
import Sidebar from "../component/Sidebar";
import { LuSmilePlus } from "react-icons/lu";
import { HiOutlinePencil, HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiArrowUturnLeft } from "react-icons/hi2";
import { FaArrowLeft } from "react-icons/fa";
import DeleteModel from "../component/DeleteModel";
import InputBox from "../component/InputBox";
import { IoCheckmark, IoCheckmarkDone, IoTimeOutline } from "react-icons/io5";
import EditMessageArea from "../component/EditMessageArea ";
import FilesView from "../component/FilesView";
import Profile from "../component/Profile";
import { getdefaultProfile } from "../helper/filePre";
import { handleScrollOriganlMessage } from "../helper/handleScrollOriganlMessage";

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
  const [editedMessage, setEditedMesage] = useState(null);
  const [allReceiverMessages, setAllReceiverMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserChat, setShowUserChat] = useState(false);
  const [replyTomessage, setReplyToMessage] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const selectedUserRef = React.useRef(null);
  const onlineUserRef = React.useRef(null);
  const messageReplyRef = useRef([]);
  const deleteMessageIdRef = React.useRef(null);
  const isFetchingOldRef = useRef(false);

  const messagesRef = useRef([]);

  const dispatch = useDispatch();
  const messageStore = useSelector((store) => store.messages);
  const receiverMessageStore = useSelector((store) => store.getMyMessages);
  const groupMessageStore = useSelector((store) => store.groupMessages);
  const messageEndRef = useRef(null);
  const chatTopRef = useRef(null);
  const firstLoadRef = useRef(true);
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
        }),
      );
    });
    newSocket.on("user-disconnected", (userId) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => String(id) !== String(userId)),
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
          msg?.clientMessageId === clientMessageId
            ? { ...msg, status: "Send" }
            : msg,
        ),
      );
    });
    newSocket.on("editMessage", ({ messageId, newText, files, chatType }) => {
      // console.log(upload)
      console.log(messageId, newText, files, chatType, "eit message come");
      if (chatType === "chat") {
        setPrivateMessages((prev) =>
          prev.map((msg) => {
            console.log(
              "msgId is",
              msg?.id,
              "and edited message id is",
              messageId,
              "which is",
              Number(msg.id) === Number(messageId),
            );
            if (Number(msg.id) === Number(messageId)) {
              return {
                ...msg,
                text: newText,
                file: files.length !== 0 ? files : [],
              };
            } else {
              return msg;
            }
          }),
        );
      } else {
        setGroupMessages((prev) =>
          prev.map((msg) =>
            Number(msg.id) === Number(messageId)
              ? { ...msg, text: newText, file: files.length !== 0 ? files : [] }
              : msg,
          ),
        );
      }

      setEditMessageId(null);
    });
    newSocket.on(
      "newMessage",
      ({ clientMessageId, response, files, replyMessage }) => {
        setSelectedFiles([]);
        console.log(
          clientMessageId,
          response,
          files,
          replyMessage,
          "new messageessssssssssss",
        );
        const currentSelectedUser = selectedUserRef.current;
        // console.log(files);
        setPrivateMessages((prev) => {
          const updated = prev.map((msg) =>
            msg?.clientMessageId === clientMessageId
              ? {
                  ...response,
                  status: "Send",
                  file: files.length > 0 ? files : [],
                  replyMessage: replyMessage ? replyMessage : null,
                }
              : msg,
          );
          const exist = updated.some((m) => m?.id === response.id);
          // console.log(exist, "exists");
          if (!exist) {
            return [
              ...updated,
              {
                ...response,
                status: "Send",
                file: files.length > 0 ? files : [],
                replyMessage: replyMessage ? replyMessage : null,
              },
            ];
          }

          return updated;
        });
        const currentOnlineUser = onlineUserRef.current;
        const recieverSocketId = currentOnlineUser.includes(
          String(logedInUser?.id),
        );

        if (response?.receiverId === logedInUser?.id && recieverSocketId) {
          if (currentSelectedUser?.id === response?.senderId) {
            newSocket.emit("status:Read", { messageId: response?.id });
          } else {
            newSocket.emit("status:delivered", { messageId: response?.id });
          }
        }
      },
    );
    newSocket.on("status:Read", ({ messageId }) => {
      setPrivateMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "Read" } : msg,
        ),
      );
    });
    newSocket.on("status:delivered", ({ messageId }) => {
      setPrivateMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "Delivered" } : msg,
        ),
      );
    });

    newSocket.on("message:deleted", ({ messageId, type, chatType }) => {
      // console.log("get delete sinal at frontend");
      const curtrentSelectedUser = selectedUserRef.current;
      const currentDeletedMessageId = deleteMessageIdRef.current;
      const currentMessages = messagesRef.current;
      // console.log("before", curtrentSelectedUser.type);

      if (type === "FOR_EVERYONE") {
        if (chatType === "group") {
          setGroupMessages((prev) => {
            return prev.map((msg) => {
              if (msg?.id === messageId) {
                return { ...msg, text: null, deletedForAll: true };
              }
              return msg;
            });
          });
        } else {
          setPrivateMessages((prev) => {
            return prev.map((msg) => {
              if (msg?.id === messageId) {
                return { ...msg, text: null, deletedForAll: true };
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
                : msg,
            ),
          );
        } else {
          setPrivateMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, deletedByMeId: logedInUser?.id }
                : msg,
            ),
          );
        }
      }
      // console.log("before update");
      if (isLastMessageDeleted(currentDeletedMessageId, currentMessages)) {
        // console.log("upddate signal client-server", currentDeletedMessageId);
        // console.log(curtrentSelectedUser, "selected uset");
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
      console.log(data, "new  group messages ");
      setReplyToMessage(null);
      setGroupMessages((prevMessages) => {
        const currentSelectedUser = selectedUserRef.current;
        if (currentSelectedUser?.id !== data?.groupId) return;

        const exists = prevMessages.some(
          (msg) => msg?.id === data.lastMessageId,
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
            replyMessageSenderId: data?.replyMessageSenderId,
            file: data?.file.length > 0 ? data?.file : null,
            replyMessage: data?.replyMessage ? data.replyMessage : null,
          },
        ];
      });
    });

    return () => newSocket.disconnect();
  }, [logedInUser?.id]);
  // console.log();
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

  useEffect(() => {
    onlineUserRef.current = onlineUsers;
  }, [onlineUsers]);
  // // console.log(messages, "mesages");
  useEffect(() => {
    if (!socket || !logedInUser?.id) return;
    if (!messages || messages.length === 0) return;
    const unDeliveredMessages = messages.filter(
      (msg) =>
        msg?.receiverId === logedInUser.id &&
        msg?.status === "Send" &&
        msg?.senderId !== selectedUser?.id,
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
        (msg?.status === "Delivered" || msg?.status === "Send"),
    );
    if (
      unReadedMessage.length > 0 &&
      onlineUsers.includes(String(logedInUser.id))
    ) {
      unReadedMessage.forEach((msg) => {
        socket.emit("status:Read", { messageId: msg?.id });
        // msg.readSent = true;
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
        lastMessageId: null,
      }),
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
  // console.log(privateMessages, "private message sis here");
  useEffect(() => {
    selectedUserRef.current = selectedUser;
    firstLoadRef.current = true;
    isFetchingOldRef.current = false;
    selectedUserRef.current = selectedUser;
    setEditMessageId(null);
    setMessage("");
    setGroupMembers([]);
    setSelectedFiles([]);
    setPrivateMessages([]);
    setGroupMembers([]);
  }, [selectedUser]);

  // console.log(replyTomessage, "reply to message id");
  const handleSendMessage = () => {
    console.log("click message button ");
    if (message.trim() === "" && selectedFiles.length === 0) return;
    console.log("loading hit before", loading);
    if (selectedFiles?.length !== 0) {
      setLoading(true);
    }

    console.log(loading, "loading hit after");
    if (selectedUser?.type === "group") {
      const id = selectedUser?.id;
      const groupId = id.split("-")[1];

      const formData = new FormData();
      formData.append("groupId", groupId);
      formData.append("message", message);
      formData.append("messageSenderId", logedInUser?.id);
      formData.append("replyToMessageId", replyTomessage?.id);
      formData.append("replyMessageSenderId", replyTomessage?.userId);
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("file", selectedFiles[i]);
      }

      dispatch(sendGroupMessage(formData))
        .unwrap()
        .then((res) => {
          // // console.log(res);
          if (res.success) {
            setSelectedFiles([]);
            console.log("before success oading is", loading);
            setLoading(false);
            console.log("after success oading is", loading);
          }
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
      setMessage("");
    } else {
      const clientMessageId = crypto.randomUUID();
      const formData = new FormData();
      formData.append("clientMessageId", clientMessageId);
      formData.append("senderId", logedInUser?.id);

      formData.append("text", message);

      formData.append("receiverId", selectedUser?.id);
      formData.append("type", selectedUser?.type);
      formData.append("replyMessageSenderId", replyTomessage?.senderId);

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("file", selectedFiles[i]);
      }
      formData.append("replyToMessageId", replyTomessage?.id);
      dispatch(sendMessage(formData))
        .unwrap()
        .then((res) => {
          if (res.success) {
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
      setMessage("");
      setReplyToMessage(null);
    }
    socket.emit("stopTyping", {
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
    });
  };
  // console.log(replyTomessage, "reply");
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
    if (groupMessageStore?.isError || !groupMessageStore?.messages) return;
    if (groupMessageStore?.isLoading) {
      setIsChatLoading(true);
    }
    const newMessages = [...groupMessageStore?.messages].reverse();
    if (groupMessageStore?.loadType === "INITIAL") {
      setGroupMessages(newMessages);
      return;
    }

    if (groupMessageStore?.loadType === "PAGINATION") {
      setGroupMessages((prev) => [...newMessages, ...prev]);
    }
    isFetchingOldRef.current = false;
  }, [groupMessageStore.messages, groupMessageStore.loadType]);
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
    dispatch(getGroupMessages({ groupId, lastMessageId: null }));
  }, [selectedUser]);

  const getDate = (date) => {
    const now = new Date(date);
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
  };
  console.log(messages);
  useEffect(() => {
    if (!messageStore?.messages?.length) return;
    console.log(messageStore?.isLoading);
    if (messageStore?.isLoading) {
      setIsChatLoading(true);
    }
    const newMessages = [...messageStore.messages].reverse();
    // console.log(messageStore);
    console.log(newMessages, "newmessages");
    if (messageStore?.loadType === "INITIAL") {
      setPrivateMessages(newMessages);
    }
    if (messageStore?.loadType === "PAGINATION") {
      setPrivateMessages((prev) => [...newMessages, ...prev]);
    }
    isFetchingOldRef.current = false;
  }, [messageStore?.messages, messageStore?.loadType]);
  const loadOldChats = (lastMessageId) => {
    if (!isFetchingOldRef.current) return;
    console.log("want to see old message", lastMessageId);
    if (selectedUser?.type === "chat") {
      dispatch(
        getAllMessages({
          senderId: logedInUser.id,
          receiverId: selectedUser.id,
          lastMessageId: lastMessageId,
        }),
      );
    }
    if (selectedUser?.type === "group") {
      const id = selectedUser?.id;
      const groupId = id.split("-")[1];

      dispatch(getGroupMessages({ groupId, lastMessageId: lastMessageId }));
    }
  };
  const handleScroll = () => {
    if (!chatTopRef.current) return;
    if (isFetchingOldRef.current) return;
    if (!messages.length) return;

    const el = chatTopRef.current;
    console.log("top", el.scrollTop, "scrollhright", el.scrollHeight,"clientheight",el.clientHeight);
    const atTop = el.scrollTop <= 20;

    if (!atTop) return;
    // const isBottom=el.scrollHeight-el.scrollTop<=
    const firstMessageId = messages[0]?.id;
    if (!firstMessageId) return;
    console.log("at top", atTop);
    isFetchingOldRef.current = true;
    loadOldChats(firstMessageId);
    // setTimeout(() => {
    //   loadOldChats(firstMessageId);
    // }, 2000);
  };

  useEffect(() => {
    if (!messageEndRef.current || !chatTopRef.current) return;
    if (!messages.length) return;
    const el = chatTopRef.current;
    console.log(firstLoadRef.current, "forst lpad");

    if (firstLoadRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "auto" });
      firstLoadRef.current = false;
      return;
    }

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    if (isAtBottom) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const handleDeleteForMe = () => {
    setIsModelOpen(false);
    const deleteMessageId = deleteMessageIdRef.current;
    // console.log(deleteMessageId);

    if (!deleteMessageId || !selectedUser) return;
    socket.emit("message:delete", {
      messageId: deleteMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_ME",
      chatType: selectedUser.type,
    });
    // console.log("delete function is call");
  };

  const isLastMessageDeleted = (messageId, currentMessages) => {
    // console.log(currentMessages, "message sis here");
    const selectedUser = selectedUserRef?.current;
    // console.log("selectedUser", selectedUser);
    if (!messageId || !currentMessages || currentMessages.length === 0)
      return false;
    const deleteMessage = currentMessages.find((msg) => msg.id === messageId);
    const messages = currentMessages.filter(
      (msg) =>
        msg.deletedByMeId !==
        (selectedUser?.type === "chat"
          ? deleteMessage?.senderId
          : deleteMessage?.userId),
    );

    const lastMessage = messages[messages.length - 1];
    if (!deleteMessage || !lastMessage) {
      return false;
    }
    return deleteMessage.id === lastMessage.id;
  };

  const handleDeleteFoEveryOne = () => {
    socket.emit("message:delete", {
      messageId: deleteMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_EVERYONE",
      chatType: selectedUser?.type,
    });
    setIsModelOpen(false);
  };
  const MessageStatus = ({ status }) => {
    switch (status) {
      case "Pending":
        return <IoTimeOutline />;
      case "Send":
        return <IoCheckmark />;
      case "Delivered":
        return <IoCheckmarkDone />;
      case "Read":
        return <IoCheckmarkDone className="text-cyan-400" />;
      default:
        return null;
    }
  };
  const handleMessageEdit = (editText, editMessageId, file) => {
    console.log(editText, editMessageId, file, "edit message file");
    setEditMessageId(editMessageId);
    setEditedMesage({ editText, file });
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setShowUserChat(false);
      } else {
        setShowUserChat(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // console.log(groupMembers);
  const getReplyName = (replySenderId) => {
    // console.log(replySenderId, "id");
    if (selectedUser?.type === "chat") {
      if (replySenderId === logedInUser?.id) {
        return logedInUser?.name;
      } else {
        return selectedUser?.name;
      }
    } else {
      const memebername = groupMembers?.find((g) => g?.id === replySenderId);
      return memebername?.name;
    }
  };
  // console.log(messages);
  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden font-nunito relative">
      {/* Sidebar - Added a subtle border-right */}
      <div
        className={`${
          showUserChat && window.innerWidth <= 768 ? "hidden" : "block"
        }  w-full max-w-full md:max-w-[280px] lg:max-w-[300px] xl:max-w-[350px] 2xl:max-w-[450px] 3xl:max-w-[500px] flex-shrink-0 border-r border-gray-200 bg-white`}
      >
        <Sidebar
          logedInUser={logedInUser}
          setLogedInUser={setLogedInUser}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          socket={socket}
          onlineUsers={onlineUsers}
          showUserChat={showUserChat}
          setShowUserChat={setShowUserChat}
        />
      </div>

      {/* Chat Area - Clean white background with flex-column */}
      <div className="flex-1 flex flex-col relative bg-white">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <LuSmilePlus size={40} className="text-[#574cd6]" />
            </div>
            <h1 className="text-base 2xl:text-xl font-semibold text-gray-600">
              Select a Conversation
            </h1>
            <p className="text-sm 2xl:text-lg">
              Pick a friend from the sidebar to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header - Glassmorphism style */}
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowUserChat(false);
                    setSelectedUser(null);
                  }}
                  className={`hover:bg-white/10 rounded-full text-[#574CD6]/90 ${
                    window.innerWidth <= 768 && showUserChat
                      ? "block"
                      : "hidden"
                  }`}
                >
                  <FaArrowLeft />
                </button>
                <div className="relative">
                  <Profile
                    getdefaultProfile={getdefaultProfile}
                    selectedUser={selectedUser}
                  />
                  {onlineUsers.includes(String(selectedUser?.id)) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                  )}
                </div>

                <div>
                  {/* 1. User/Group Name */}
                  <div className="font-medium 2xl:font-bold text-gray-800 text-sm xs:text-sm 2xl:text-xl 3xl:text-2xl leading-tight">
                    {selectedUser.name}
                  </div>

                  {/* 2. Secondary Status Line */}
                  <div className="flex gap-1 items-center text-xs 2xl:text-sm 3xl:text-xl">
                    <div className="flex items-center gap-1.5 ">
                      {selectedUser.type === "group" && (
                        <div
                          className={`hidden xs:flex items-center  font-medium text-gray-500`}
                        >
                          <span>{groupMembers.length} members</span>
                          <span className="mx-1">•</span>
                          <span className="text-[#574CD6] text-sm 2xl:text-base 3xl:text-lg">
                            {
                              groupMembers.filter((m) =>
                                onlineUsers.includes(String(m.id)),
                              ).length
                            }{" "}
                            online
                          </span>
                        </div>
                      )}
                      {!onlineUsers.includes(String(selectedUser.id)) &&
                        selectedUser?.LastActiveAt && (
                          <span className="text-[#574CD6] ">
                            Last seen {getDate(selectedUser?.LastActiveAt)}
                          </span>
                        )}
                    </div>
                    {selectedUser.type === "group" && (
                      <div className="flex ml-0 xs:ml-2 gap-x-1 max-w-[150px] xs:max-w-20 md:max-w-[100px] lg:max-w-[250px]">
                        <span className="truncate whitespace-nowrap">
                          {groupMembers.map((member, index) => {
                            const isMemberOnline = onlineUsers.includes(
                              String(member?.id),
                            );

                            return (
                              <span key={member?.id}>
                                <span
                                  className={`transition-colors duration-300 ${
                                    isMemberOnline
                                      ? "text-[#574CD6] font-semibold"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {member.name}
                                </span>
                                {index < groupMembers.length - 1 && ", "}
                              </span>
                            );
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3. Group Members Detail (Only for groups) */}
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 text-[22px]">
                <HiOutlineDotsHorizontal />
              </button>
            </div>

            {/* Messages Area - Subtle background color change */}
            <div
              ref={chatTopRef}
              onScroll={handleScroll}
              className="flex-1 px-3 xl:px-6 py-4 overflow-y-auto bg-[#F9FAFB] space-y-7 border-4"
            >
              {(messages || []).map((msg) => {
                const isChatMessage =
                  selectedUser?.type === "group"
                    ? Number(msg.groupId) ===
                      Number(selectedUser.id.split("-")[1])
                    : (msg?.senderId === logedInUser?.id &&
                        msg?.receiverId === selectedUser?.id) ||
                      (msg?.senderId === selectedUser?.id &&
                        msg?.receiverId === logedInUser?.id);

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
                    ref={(el) => {
                      if (el) {
                        messageReplyRef.current[msg?.id] = el;
                      }
                    }}
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={` w-full ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
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
                              className="w-6 xl:w-10 3xl:w-12 h-6 xl:h-10 3xl:h-12 rounded-full object-cover ring-2 ring-gray-50"
                            />
                          ) : (
                            <div className="w-6 xl:w-10 3xl:w-12 h-6 xl:h-10 3xl:h-12 rounded-full bg-indigo-50 flex items-center justify-center text-[#574CD6] font-bold border border-indigo-100">
                              {getdefaultProfile(avatarName)}
                            </div>
                          )}
                        </div>
                        {editMessageId !== null && msg.id === editMessageId ? (
                          <EditMessageArea
                            editedMessage={editedMessage}
                            setEditedMessage={setEditedMesage}
                            setEditMessageId={setDeleteMessageId}
                            editMessageId={editMessageId}
                            logedInUser={logedInUser}
                            selectedUser={selectedUser}
                            socket={socket}
                            onCancel={() => {
                              setEditedMesage("");
                              setEditMessageId(null);
                            }}
                            // onSave={() => sendEditMessage()}
                          />
                        ) : (
                          <div
                            className={`px-2 sm:px-3 2xl:px-4 relative group py-1 sm:py-2 shadow-sm text-sm leading-relaxed max-w-[230px] xs:max-w-[250px] lg:max-w-[300px] xl:max-w-[350px] 2xl:max-w-[500px]  3xl:max-w-[624px] flex ${
                              selectedFiles?.length > 0 ? "flex-1" : "w-fit"
                            } flex-col break-words ${
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
                                onClick={() =>
                                  handleMessageEdit(
                                    msg?.text,
                                    msg?.id,
                                    msg?.file,
                                  )
                                }
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
                              <button
                                onClick={() => setReplyToMessage(msg)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                              >
                                <HiArrowUturnLeft size={16} />
                              </button>
                            </div>
                            {msg?.text === null ? (
                              <p className="text-xs 2xl:text-lg 3xl:text-[22px] leading-relaxed">
                                <span className="italic opacity-70">
                                  This message was deleted
                                </span>
                              </p>
                            ) : (
                              <div className={`flex flex-col 3xl:gap-2`}>
                                {msg?.replyMessage?.id && (
                                  /* The Reply Container */
                                  <div
                                    onClick={() => {
                                      handleScrollOriganlMessage(
                                        msg?.replyMessage?.id,
                                        messageReplyRef,
                                      );
                                    }}
                                    className={`
  mb-2 p-2 rounded-r-lg border-l-4 text-xs cursor-pointer
  ${
    isMe
      ? "bg-black/15 border-white/60 text-white"
      : "bg-black/5 border-[#574CD6]/40 text-gray-700"
  }
`}
                                  >
                                    <div className="flex items-center justify-between mb-1 gap-3">
                                      <p
                                        className={`font-bold text-[11px] ${
                                          isMe ? "text-white" : "text-[#574CD6]"
                                        }`}
                                      >
                                        {getReplyName(
                                          msg?.replyMessageSenderId,
                                        )}
                                        {/* {msg?.replyMessageSenderId} */}
                                        {/* {selectedUser?.type==="chat"?msg?.replyMessage?replyMessageSenderId===logedInUser?.id?logedInUser?.name:selectedUser?.name:""} */}
                                      </p>
                                      <p
                                        className={`text-[10px] ${
                                          isMe
                                            ? "text-white/60"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {getDate(msg?.replyMessage?.createdAt)}
                                      </p>
                                    </div>

                                    {/* Reply Content */}
                                    <div className="truncate">
                                      {msg?.replyMessage?.text?.trim() !==
                                        "" && (
                                        <p
                                          className={`overflow-hidden text-ellipsis line-clamp-1 italic ${
                                            isMe
                                              ? "text-white/80"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          {msg?.replyMessage?.text}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Main Message Text */}
                                <p className="text-xs 2xl:text-lg 3xl:text-[22px] leading-relaxed">
                                  {msg.text === null ? (
                                    <span className="italic opacity-70">
                                      This message was deleted
                                    </span>
                                  ) : (
                                    msg.text
                                  )}
                                </p>

                                <FilesView msg={msg} />
                              </div>
                            )}

                            {/* Footer: Time + Status */}
                            <div
                              className={`mt-1 flex items-center gap-1 ${
                                isMe
                                  ? "text-indigo-100 justify-end"
                                  : "text-gray-500 justify-start"
                              }`}
                            >
                              <span className="text-[10px] 2xl:text-sm 3xl:text-lg">
                                {getDate(msg?.createdAt)}
                              </span>

                              {/* Status Icons - Only show for messages I sent */}
                              {isMe && (
                                <span className="flex items-center text-base 2xl:text-xl 3xl:text-2xl">
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
              <div ref={messageEndRef} className="h-2"></div>
            </div>

            {/* Input Wrapper - Clean Padding */}
            <div className="px-5 xl:px-12 py-4">
              <InputBox
                typingUserId={typingUserId}
                selectedUser={selectedUser}
                setMessage={setMessage}
                message={message}
                handleMessage={handleMessage}
                handleSendMessage={handleSendMessage}
                setShowImozi={setShowImozi}
                showImozi={showImozi}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                loading={loading}
                replyTomessage={replyTomessage}
                setReplyToMessage={setReplyToMessage}
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
