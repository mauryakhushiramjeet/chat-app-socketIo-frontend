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
  updateMembersLastMsgSeenId,
} from "../store/actions/messageActions";
import Sidebar from "../component/Sidebar";
import { LuSmilePlus } from "react-icons/lu";
import { HiOutlinePencil, HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiArrowUturnLeft } from "react-icons/hi2";
import { FaArrowLeft } from "react-icons/fa";
import DeleteModel from "../component/DeleteModel";
import InputBox from "../component/InputBox";
import EditMessageArea from "../component/EditMessageArea ";
import FilesView from "../component/FilesView";
import Profile from "../component/Profile";
import { getdefaultProfile } from "../helper/filePre";
import { handleScrollOriganlMessage } from "../helper/handleScrollOriganlMessage";
import ChatMessageShimmer from "../component/ChatMessageShimmer ";
import { getDateSeperator } from "../helper/getDateSeparator";
import ChatOptions from "../component/ChatOptions";
import GroupMessageSeen from "../component/GroupMessageSeen ";
import { getGroupMemberName, MessageStatus } from "../helper/chatPageHelper";
import PinPongNotification from "../component/PinPongNotification ";

const ChatPage = () => {
  // --- ALL LOGIC KEPT EXACTLY THE SAME ---
  const [logedInUser, setLogedInUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModelOpen, setIsModelOpen] = useState(null);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [typingUserId, setTypingUserId] = useState({});
  const [typingInfo, setTypingInfo] = useState({});
  const [showImozi, setShowImozi] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editedMessage, setEditedMesage] = useState(null);
  const [allReceiverMessages, setAllReceiverMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [seenMembers, setSeenMberes] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserChat, setShowUserChat] = useState(false);
  const [replyTomessage, setReplyToMessage] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [firstMessageId, setFirstMessageId] = useState(null);
  // const [isPagination, setIsPagination] = useState(false);
  const selectedUserRef = React.useRef(null);
  const onlineUserRef = React.useRef(null);
  const messageReplyRef = useRef([]);
  const isFetchingOldRef = useRef(false);
  const TypingTimeOut = useRef(null);

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
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);
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
    newSocket.on("clearChat", (data) => {
      const { chatPartnerUserId, userId, groupId, deletedAt } = data.clearChat;

      setShowChatOptions(false);
      const { type } = data;

      const currentSelectedUser = selectedUserRef.current;

      const selectedUserId =
        type === "group"
          ? currentSelectedUser?.id?.split("-")[1]
          : currentSelectedUser?.id;

      const partner = type === "group" ? groupId : chatPartnerUserId;

      const isSameChat =
        Number(selectedUserId) === Number(partner) &&
        Number(logedInUser?.id) === Number(userId);

      const deletedAtTime = new Date(deletedAt).getTime();
      if (isSameChat) {
        if (type === "chat") {
          setPrivateMessages((prev) =>
            prev.filter(
              (msg) => new Date(msg.createdAt).getTime() > deletedAtTime,
            ),
          );
        } else {
          setGroupMessages((prev) =>
            prev.filter(
              (msg) => new Date(msg.createdAt).getTime() > deletedAtTime,
            ),
          );
        }
      }
    });

    newSocket.on("editMessage:error", ({ message }) => {
      setEditMessageId(null);
    });
    newSocket.on("userTyping", ({ senderId, receiverId, type, groupId }) => {
      if (receiverId !== logedInUser?.id) return;

      if (type === "group") {
        setTypingUserId((prev) => ({ ...prev, [`group_${senderId}`]: true }));
        const data = {
          receiverId,
          groupId,
          senderId,
          type,
        };

        setTypingInfo((prev) => {
          const groupKey = `group_${groupId}`;
          const existing = prev[groupKey] || [];
          const group_sender_alreadyExist = existing?.find(
            (s) => Number(s?.senderId) === Number(senderId),
          );

          return {
            ...prev,
            [groupKey]: group_sender_alreadyExist
              ? existing.map((s) => (s.senderId === senderId ? data : s))
              : [...existing, data],
          };
        });
      } else {
        const data = {
          receiverId,
          groupId: null,
          type,
        };
        setTypingInfo((prev) => ({
          ...prev,
          [`chat_${senderId}`]: data,
        }));
        setTypingUserId((prev) => ({ ...prev, [`chat_${senderId}`]: true }));
      }
    });
    newSocket.on(
      "userStopTyping",
      ({ senderId, receiverId, type, groupId }) => {
        if (receiverId === logedInUser?.id) {
          if (type === "group") {
            setTypingUserId((prev) => ({
              ...prev,
              [`${type}_${senderId}`]: false,
            }));
            setTypingInfo((prev) => {
              const groupKey = `group_${groupId}`;
              const existing = prev[groupKey] || [];
              const group_sender_alreadyExist = existing?.find(
                (s) => s?.senderId === senderId,
              );

              return {
                ...prev,
                [groupKey]: group_sender_alreadyExist
                  ? existing?.filter((s) => s.senderId !== senderId)
                  : existing,
              };
            });
          } else {
            setTypingUserId((prev) => ({
              ...prev,
              [`${type}_${senderId}`]: false,
            }));
            setTypingInfo((prev) => ({
              ...prev,
              [`chat_${senderId}`]: null,
            }));
          }
        }
      },
    );
    newSocket.on("status:send", ({ clientMessageId }) => {
      setPrivateMessages((prev) =>
        prev?.map((msg) =>
          msg?.clientMessageId === clientMessageId
            ? { ...msg, status: "Send" }
            : msg,
        ),
      );
    });
    newSocket.on("editMessage", ({ messageId, newText, files, chatType }) => {
      if (chatType === "chat") {
        setPrivateMessages((prev) =>
          prev.map((msg) => {
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

        const currentSelectedUser = selectedUserRef.current;
        setPrivateMessages((prev) => {
          const updated = prev?.map((msg) =>
            msg?.clientMessageId === clientMessageId
              ? {
                  ...response,
                  status: "Send",
                  file: files?.length > 0 ? files : [],
                  replyMessage: replyMessage ? replyMessage : null,
                }
              : msg,
          );
          const exist = updated?.some((m) => m?.id === response.id);
          if (!exist) {
            return [
              ...updated,
              {
                ...response,
                status: "Send",
                file: files?.length > 0 ? files : [],
                replyMessage: replyMessage ? replyMessage : null,
              },
            ];
          }

          return updated;
        });
        const currentOnlineUser = onlineUserRef.current;
        const selectedUser = selectedUserRef.current;
        const recieverSocketId = currentOnlineUser.includes(
          String(logedInUser?.id),
        );

        if (response?.receiverId === logedInUser?.id && recieverSocketId) {
          if (currentSelectedUser?.id === response?.senderId) {
            newSocket.emit("status:Read", {
              messageId: response?.id,
              conversationId: selectedUser?.mainId,
            });
          } else {
            newSocket.emit("status:delivered", {
              messageId: response?.id,
              conversationId: selectedUser?.mainId,
            });
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

    newSocket.on(
      "message:deleted",
      ({ messageId, type, chatType, lastMessageCreatedAt }) => {
        const curtrentSelectedUser = selectedUserRef.current;
        const currentDeletedMessageId = messageId;
        const currentMessages = messagesRef.current;

        if (type === "FOR_EVERYONE") {
          if (chatType === "group") {
            setGroupMessages((prev) => {
              return prev.map((msg) => {
                if (msg?.id === messageId) {
                  return {
                    ...msg,
                    text: null,
                    deletedForAll: true,
                    lastMessageCreatedAt: lastMessageCreatedAt
                      ? lastMessageCreatedAt
                      : null,
                  };
                }
                return msg;
              });
            });
          } else {
            setPrivateMessages((prev) => {
              return prev.map((msg) => {
                if (msg?.id === messageId) {
                  return {
                    ...msg,
                    text: null,
                    deletedForAll: true,
                    lastMessageCreatedAt: lastMessageCreatedAt
                      ? lastMessageCreatedAt
                      : null,
                  };
                }
                return msg;
              });
            });
          }
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
        if (isLastMessageDeleted(currentDeletedMessageId, currentMessages)) {
          newSocket.emit("sidebar:update", {
            chatType: curtrentSelectedUser?.type,
            senderId: logedInUser?.id,
            receiverId: curtrentSelectedUser?.id,
            messageId: currentDeletedMessageId,
            chatListId: curtrentSelectedUser?.mainId,
          });
        }
        setIsModelOpen(false);
      },
    );
    newSocket.on("receiveGropMessage", (data) => {
      setReplyToMessage(null);
      const currentSelectedUser = selectedUserRef.current;

      setGroupMessages((prevMessages) => {
        if (currentSelectedUser?.id !== data?.groupId) return;

        const exists = prevMessages.some(
          (msg) => msg?.id === data.lastMessageId,
        );
        if (exists) return prevMessages;

        return [
          ...prevMessages,
          {
            id: data.lastMessageId,
            text: data.message,
            groupId: data.groupId.split("-")[1],
            createdAt: new Date(),
            sender: data.sender,
            status: "Delivered",
            userId: data.sender.id,
            replyMessageSenderId: data?.replyMessageSenderId,
            file: data?.file && data?.file.length !== 0 ? data?.file : null,
            replyMessage: data?.replyMessage ? data.replyMessage : null,
          },
        ];
      });
      const messageSenderId = data?.sender?.id;
      const lastMessageId = Number(data?.lastMessageId);
      const memberId = Number(logedInUser?.id);
      const isMyMsg = Number(messageSenderId) === Number(logedInUser?.id);
      const groupId = Number(data?.groupId?.split("-")[1]);
      const inCommingGroupMsgId = currentSelectedUser?.mainId;
      const isMyGroupChatOpen = Number(inCommingGroupMsgId) === Number(groupId);

      if (isMyMsg) return;
      if (!isMyGroupChatOpen) return;
      newSocket.emit("memeberLastMsgSeenUpdate", {
        messageSenderId,
        lastMessageId,
        memberId,
        groupId,
      });
    });
    newSocket.on("groupMsgSeen", ({ memebers }) => {
      setSeenMberes(memebers);
    });
    return () => newSocket.disconnect();
  }, [logedInUser]);
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
  }, [logedInUser?.id, selectedUser?.id, selectedUser, dispatch]);

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
    socket.emit("typing", {
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: selectedUser?.type,
      groupId:
        selectedUser?.type === "group" ? selectedUser?.id.split("-")[1] : null,
    });
    if (TypingTimeOut.current) {
      clearTimeout(TypingTimeOut.current);
    }
    // setTimeout(() => {
    //   socket.emit("stopTyping", {
    //     senderId: logedInUser?.id,
    //     receiverId: selectedUser?.id,
    //     type: selectedUser?.type,
    //     groupId:
    //       selectedUser?.type === "group"
    //         ? Number(selectedUser?.id?.split("-")[1])
    //         : null,
    //   });
    // }, 1000);

    TypingTimeOut.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: logedInUser?.id,
        receiverId: selectedUser?.id,
        type: selectedUser?.type,
        // conversationId:sele
        groupId:
          selectedUser?.type === "group"
            ? Number(selectedUser?.id?.split("-")[1])
            : null,
      });
    }, 2000);
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    firstLoadRef.current = true;
    isFetchingOldRef.current = false;
    selectedUserRef.current = selectedUser;
    setEditMessageId(null);
    setMessage("");
    setSelectedFiles([]);
    setPrivateMessages([]);
    setFirstMessageId(null);
  }, [selectedUser]);

  useLayoutEffect(() => {
    if (chatTopRef.current) {
      chatTopRef.current.scrollTop = 0;
    }
  }, [selectedUser]);
  const handleSendMessage = () => {
    if (message.trim() === "" && selectedFiles.length === 0) return;
    if (selectedFiles?.length !== 0) {
      setLoading(true);
    }

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
          if (res.success) {
            setSelectedFiles([]);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
      setMessage("");
    } else {
      const clientMessageId = crypto.randomUUID;
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
    // socket.emit("stopTyping", {
    //   senderId: logedInUser?.id,
    //   receiverId: selectedUser?.id,
    //   type: selectedUser?.type,
    //   groupId:
    //     selectedUser?.type === "group"
    //       ? Number(selectedUser?.id?.split("-")[1])
    //       : null,
    // });
  };

  useEffect(() => {
    if (!logedInUser?.id) return;
    if (!onlineUsers.includes(String(logedInUser?.id)) || selectedUser) return;
    const receiverId = logedInUser?.id;
    dispatch(getAllReceiverMesages({ receiverId }));
  }, [logedInUser?.id, dispatch, messages, onlineUsers, selectedUser]);
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
    setIsChatLoading(groupMessageStore?.isLoading);
    if (groupMessageStore?.messages?.length === 0) {
      setIsChatLoading(false);
      return;
    }
    if (groupMessageStore?.fisrtMessageId) {
      setFirstMessageId(groupMessageStore?.fisrtMessageId);
    }
    const newMessages = [...groupMessageStore?.messages].reverse();
    setGroupMembers(groupMessageStore.members);

    if (groupMessageStore?.loadType === "INITIAL") {
      setGroupMessages(newMessages);
      return;
    }

    if (groupMessageStore?.loadType === "PAGINATION") {
      setGroupMessages((prev) => [...newMessages, ...prev]);
    }
    isFetchingOldRef.current = false;
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
    const senderId = logedInUser?.id;
    dispatch(getGroupMessages({ senderId, groupId, lastMessageId: null }));
  }, [selectedUser, logedInUser?.id, dispatch]);

  useEffect(() => {
    if (!groupMessages || groupMessages?.length === 0) return;
    if (selectedUser && selectedUser?.type !== "group") return;
    const mylastMessageId = groupMembers?.find(
      (m) => m?.user?.id === logedInUser?.id,
    );

    if (
      groupMessages[groupMessages.length - 1]?.id ===
      mylastMessageId?.lastSeenMessageId
    )
      return;
    const groupId =
      selectedUser.type === "group"
        ? Number(selectedUser?.id?.split("-")[1])
        : null;
    const lastMessageId = groupMessages[groupMessages.length - 1]?.id;
    dispatch(
      updateMembersLastMsgSeenId({
        groupId,
        lastMessageId,
        userId: logedInUser?.id,
      }),
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
          socket.emit("groupMsgSeen", {
            groupId,
            messageSenderUserId:
              groupMessages[groupMessages.length - 1]?.userId,
          });
          setGroupMembers(res?.memebers);
        }
      })
      .catch((error) => [console.log(error)]);
  }, [
    groupMessages,
    logedInUser,
    selectedUser,
    socket,
    groupMembers,
    dispatch,
  ]);
  const getDate = (date) => {
    const now = new Date(date);
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
  };
  useEffect(() => {
    if (!messageStore) return;
    setIsChatLoading(messageStore?.isLoading);

    if (messageStore?.messages?.length === 0) {
      setIsChatLoading(false);
      return;
    }
    console.log(messageStore?.isLoading, "see actual loading");
    if (messageStore?.fisrtMessageId) {
      setFirstMessageId(messageStore?.fisrtMessageId);
    }
    const newMessages = [...messageStore.messages].reverse();
    if (messageStore?.loadType === "INITIAL") {
      setPrivateMessages(newMessages);
    }
    if (messageStore?.loadType === "PAGINATION") {
      setPrivateMessages((prev) => [...newMessages, ...prev]);
    }
    isFetchingOldRef.current = false;
    // setIsPagination(false);
    console.log(messageStore, "store");
  }, [
    messageStore,
    messageStore?.messages,
    messageStore?.loadType,
    messageStore?.isLoading,
    messageStore?.fisrtMessageId,
  ]);
  const loadOldChats = (lastMessageId) => {
    if (!isFetchingOldRef.current) return;

    // const el = chatTopRef.current;
    if (firstMessageId === lastMessageId) return;
    // setPrevHeight({
    //   prevScrollTop: el.scrollTop,
    //   prevScrollHeight: el.scrollHeight,
    // });

    // setIsPagination(true);
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

      dispatch(
        getGroupMessages({
          senderId: logedInUser?.id,
          groupId,
          lastMessageId: lastMessageId,
        }),
      );
    }
  };

  // useLayoutEffect(() => {
  //   if (!chatTopRef.current || !isPagination || !prevHeight.prevScrollHeight)
  //     return;

  //   const el = chatTopRef.current;

  //   // Calculate how much the height increased
  //   const heightDifference = el.scrollHeight - prevHeight.prevScrollHeight;

  //   // Maintain the scroll position relative to the previous "top" message
  //   el.scrollTop = prevHeight.prevScrollTop + heightDifference;

  //   // Reset pagination flag
  //   setIsPagination(false);
  // }, [messages, isPagination]);
  const handleScroll = () => {
    if (!chatTopRef.current) return;
    if (isFetchingOldRef.current) return;
    if (!messages?.length) return;

    const el = chatTopRef.current;
    const atTop = el.scrollTop <= 20;
    if (!atTop) return;

    const firstMessageId = messages[0]?.id;
    if (!firstMessageId) return;
    isFetchingOldRef.current = true;
    loadOldChats(firstMessageId);
  };

  useEffect(() => {
    if (!messageEndRef.current || !chatTopRef.current) return;
    if (!messages?.length) return;
    const el = chatTopRef.current;
    if (firstLoadRef.current) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (messageEndRef.current && chatTopRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "auto" });
          }
        }, 0);
      });
      firstLoadRef.current = false;
      return;
    }

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isAtBottom) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDeleteForMe = () => {
    const deletedMessageId = isModelOpen;

    if (!deletedMessageId || !selectedUser) return;

    socket.emit("message:delete", {
      messageId: deletedMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_ME",
      chatType: selectedUser.type,
    });
    setIsModelOpen(null);
  };

  const isLastMessageDeleted = (messageId, currentMessages) => {
    const selectedUser = selectedUserRef?.current;
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
    const deletedMessageId = isModelOpen;
    socket.emit("message:delete", {
      messageId: deletedMessageId,
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
      type: "FOR_EVERYONE",
      chatType: selectedUser?.type,
    });
    setIsModelOpen(null);
  };
  // const MessageStatus = ({ status }) => {
  //   switch (status) {
  //     case "Pending":
  //       return <IoTimeOutline />;
  //     case "Send":
  //       return <IoCheckmark />;
  //     case "Delivered":
  //       return <IoCheckmarkDone />;
  //     case "Read":
  //       return <IoCheckmarkDone className="text-cyan-400" />;
  //     default:
  //       return null;
  //   }
  // };
  const handleMessageEdit = (editText, editMessageId, file) => {
    setEditMessageId(editMessageId);
    setEditedMesage({ editText, file });
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setShowImozi(false);
        setShowUserChat(false);
      } else {
        // if (showUserChat) return;
        setShowUserChat(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getReplyName = (replySenderId) => {
    if (selectedUser?.type === "chat") {
      if (replySenderId === logedInUser?.id) {
        return logedInUser?.name;
      } else {
        return selectedUser?.name;
      }
    } else {
      const memebername = groupMembers?.find(
        (g) => g?.user?.id === replySenderId,
      );
      return memebername?.user?.name;
    }
  };

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
          typingInfo={typingInfo}
          setLogedInUser={setLogedInUser}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          socket={socket}
          onlineUsers={onlineUsers}
          setShowUserChat={setShowUserChat}
          typingUserId={typingUserId}
        />
      </div>

      {/* Chat Area - Clean white background with flex-column */}
      <div className="flex-1 flex flex-col relative bg-chatImg bg-cover bg-center bg-no-repeatg">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center">
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
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 ">
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

                  <div className="flex gap-1 items-center text-xs md:text-sm 2xl:text-sm 3xl:text-xl">
                    <div className="flex items-center gap-1.5 ">
                      {selectedUser.type === "group" && (
                        <div
                          className={`hidden xs:flex items-center  font-medium text-gray-500`}
                        >
                          <span>{groupMembers?.length} members</span>
                          <span className="mx-1">•</span>
                          <span className="text-[#574CD6] text-sm 2xl:text-base 3xl:text-lg">
                            {
                              groupMembers?.filter((m) =>
                                onlineUsers?.includes(String(m?.user?.id)),
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
                          {groupMembers?.map((member, index) => {
                            const isMemberOnline = onlineUsers.includes(
                              String(member?.user?.id),
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
                                  {member?.user?.name}
                                </span>
                                {index < groupMembers?.length - 1 && ", "}
                              </span>
                            );
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                {" "}
                <button
                  onClick={() => setShowChatOptions(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 text-[22px]"
                >
                  <HiOutlineDotsHorizontal />
                </button>
                <ChatOptions
                  open={showChatOptions}
                  setShowChatOptions={setShowChatOptions}
                  loggedUser={logedInUser}
                  selectedUser={selectedUser}
                  socket={socket}
                  messages={messages}
                />
              </div>
            </div>
            {/* chat sections */}
            <div
              ref={chatTopRef}
              onScroll={handleScroll}
              className="flex-1 px-3 xl:px-6 py-4 overflow-y-auto space-y-7 relative"
            >
              {isChatLoading && <ChatMessageShimmer />}
              {(messages || []).map((msg, index) => {
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
                const currentLabel = getDateSeperator(msg?.createdAt);
                const prevLabel =
                  index > 0
                    ? getDateSeperator(messages[index - 1]?.createdAt)
                    : null;
                const showDateSeparator = currentLabel !== prevLabel;

                return (
                  <div key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-2">
                        <span className="bg-gray-200 px-3 py-1 rounded-full text-xs 2xl:text-base text-gray-600">
                          {currentLabel}
                        </span>
                      </div>
                    )}
                    <div
                      ref={(el) => {
                        if (el) {
                          messageReplyRef.current[msg?.id] = el;
                        }
                      }}
                      className={`flex w-full ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* show date seperator */}

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
                            className={`${!isMe ? "hidden md:block shrink-0" : "hidden"} `}
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
                          {editMessageId !== null &&
                          msg.id === editMessageId ? (
                            <EditMessageArea
                              editedMessage={editedMessage}
                              setEditedMessage={setEditedMesage}
                              editMessageId={editMessageId}
                              logedInUser={logedInUser}
                              selectedUser={selectedUser}
                              socket={socket}
                              onCancel={() => {
                                setEditedMesage("");
                                setEditMessageId(null);
                              }}
                            />
                          ) : (
                            <div
                              className={`p-1 xs:p-2 sm:p-3 2xl:p-4 relative group shadow-sm text-sm leading-relaxed 
    max-w-[240px] xs:max-w-[300px] sm:max-w-[350px] lg:max-w-[500px] xl:max-w-[550px] 2xl:max-w-[700px] 
    flex w-fit flex-col break-words 
    ${
      isMe
        ? `${msg.text === null ? "bg-[#574CD6]/80" : "bg-[#574CD6]"} 
           text-white rounded-2xl rounded-tr-none 
           before:content-[''] before:absolute before:top-0 before:-right-2 
           before:w-0 before:h-0 before:border-t-[10px] before:border-t-[#574CD6] 
           before:border-r-[10px] before:border-r-transparent`
        : "bg-gray-200 text-gray-800 rounded-2xl rounded-tl-none border border-gray-100 " +
          "before:content-[''] before:absolute before:top-0 before:-left-2 " +
          "before:w-0 before:h-0 before:border-t-[10px] before:border-t-gray-200 " +
          "before:border-l-[10px] before:border-l-transparent"
    }`}
                            >
                              <div>
                                <div
                                  className={`${isMe ? "hidden" : "block"} ${selectedUser?.type === "group" ? "block" : "hidden"} absolute top-[-20px] 2xl:top-[-25px] left-0 text-nowrap font-semibold text-xs md:text-sm 2xl:text-base text-indigo-600/80`}
                                >
                                  {getGroupMemberName({ msg, groupMembers })}
                                </div>
                                <div
                                  className={`absolute ${
                                    msg.text === null ||
                                    msg.id === editMessageId
                                      ? "hidden"
                                      : "block"
                                  } top-[-35px] ${
                                    isMe ? "right-0" : "left-0"
                                  } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center bg-white border border-gray-100 rounded-lg shadow-xl px-1 py-0.5 z`}
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
                                    className={`${isMe ? "block" : "hidden"} p-1.5 text-gray-400 hover:text-indigo-600 rounded-md transition-colors`}
                                  >
                                    <HiOutlinePencil size={16} />
                                  </button>
                                  {isMe && (
                                    <button
                                      onClick={() => {
                                        setIsModelOpen(msg?.id);
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
                                  <p className="text-xs md:text-sm 2xl:text-lg 3xl:text-[22px] leading-relaxed">
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
                                            className={`text-xs md:text-sm 2xl:text-lg 3xl:text:xl  font-bold text-[11px] ${
                                              isMe
                                                ? "text-white"
                                                : "text-[#574CD6]"
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
                                            {getDate(
                                              msg?.replyMessage?.createdAt,
                                            )}
                                          </p>
                                        </div>

                                        {/* Reply Content */}
                                        <div className="truncate">
                                          {msg?.replyMessage?.text?.trim() !==
                                            "" && (
                                            <p
                                              className={` text-xs md:text-sm 2xl:text-lg 3xl:text-[22px]overflow-hidden text-ellipsis line-clamp-1 italic ${
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
                                    <p className="text-xs md:text-sm 2xl:text-lg 3xl:text-[22px] leading-relaxed">
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
                                  <span className="text-[10px] md:text-xs 2xl:text-sm 3xl:text-base">
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
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <GroupMessageSeen
                lastMessageId={
                  messages && messages.length > 0
                    ? Number(messages[messages.length - 1].id)
                    : null
                }
                members={
                  seenMembers && seenMembers.length !== 0
                    ? seenMembers
                    : groupMembers
                }
                // seenMembers={seenMembers}
                messages={messages}
                type={selectedUser?.type}
                currentUserId={logedInUser?.id}
              />
              <div ref={messageEndRef} className=""></div>
              <PinPongNotification />
            </div>

            {/* Input Wrapper - Clean Padding */}
            <div className="px-3 xl:px-6 py-4">
              <InputBox
                typingUserId={typingUserId}
                typingInfo={typingInfo}
                logedInUser={logedInUser}
                groupMembers={groupMembers}
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
