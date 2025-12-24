import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllFriends } from "../store/actions/userActions";
import io from "socket.io-client";
import { IoSend } from "react-icons/io5";
import { getAllMesages } from "../store/actions/messageActions";

const ChatPage = () => {
  const [logedInUser, setLogedInUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const selectedUserRef = React.useRef(null);
  const dispatch = useDispatch();
  const storeFriends = useSelector((store) => store.friends);
  const messageStore = useSelector((store) => store.messages);
  const messageRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: "",
      text: "",
      receiverId: "",
      senderId: "",
      createdAt: "",
    },
  ]);
  useEffect(() => {
    const newSocket = io("http://localhost:8085");
    console.log("socket initialized:", newSocket);
    setSocket(newSocket);

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
        console.log("signle hit for typing stop");

        setTypingUserId(null);
      }
    });
    newSocket.on("newMessage", ({ resposne }) => {
      console.log("new message is come");
      console.log(resposne);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: resposne?.text,
          receiverId: resposne?.receiverId,
          senderId: resposne?.senderId,
          createdAt: resposne?.createdAt,
        },
      ]);
    });
    return () => newSocket.disconnect();
  }, [logedInUser?.id]);

  useEffect(() => {
    if (!socket || !logedInUser?.id || !selectedUser?.id) {
      console.log("not join");
      return;
    }
    const senderId = logedInUser?.id;
    const receiverId = selectedUser?.id;

    dispatch(getAllMesages({ senderId, receiverId }));
  }, [socket, logedInUser, selectedUser, dispatch]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    console.log(user);
    setLogedInUser(user);
  }, []);
  useEffect(() => {
    if (logedInUser?.id) {
      const id = logedInUser?.id;
      console.log(id);
      dispatch(getAllFriends(id));
    }
  }, [logedInUser, dispatch]);
  const friends = useMemo(() => {
    return storeFriends?.user?.friends;
  }, [storeFriends]);

  useEffect(() => {
    if (!socket || !logedInUser?.id || !selectedUser?.id) {
      console.log("not join");
      return;
    }

    const senderId = logedInUser?.id;
    const receiverId = selectedUser?.id;

    socket.emit("joinRoom", { senderId, receiverId });
    console.log("Joined room:", senderId, receiverId);
  }, [socket, logedInUser, selectedUser]);

  const handleMessage = (e) => {
    setMessage(e.target.value);
    if (e.target.value) {
      console.log("📤 typing emit:", {
        senderId: logedInUser?.id,
        receiverId: selectedUser?.id,
      });
      socket.emit("typing", {
        senderId: logedInUser?.id,
        receiverId: selectedUser?.id,
      });
    }
    if (e.target.value === "") {
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
    const senderId = logedInUser?.id;
    const receiverId = selectedUser?.id;
    const text = message;
    socket.emit("sendMessage", { senderId, receiverId, text });
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: message,
        receiverId: selectedUser?.id,
        senderId: logedInUser?.id,
        createdAt: new Date(),
      },
    ]);
    console.log("message is send");
    setMessage("");
    socket.emit("stopTyping", {
      senderId: logedInUser?.id,
      receiverId: selectedUser?.id,
    });
  };
  const getDate = (date) => {
    const now = new Date(date);
    const min = now.getMinutes();
    const sec = now.getSeconds();
    return `${min}:${sec}`;
  };
  useEffect(() => {
    if (messageStore?.messages.length === 0) return;
    // setMessages((prev)=>[...prev,{ id:prev.length+1,
    //     text: message,
    //     receiverId: selectedUser?.id,
    //     senderId: logedInUser?.id,
    //     createdAt: }])
    setMessages(messageStore?.messages);
  }, [messageStore]);
  useEffect(() => {
    if (messageRef.current) {
    messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-[#574CD6] text-white flex flex-col p-4">
        {/* Logged-in User */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/50">
          <img
            src={logedInUser?.image}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <div className="font-bold">{logedInUser?.name}</div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search Conversations"
            className="w-full py-2 px-4 rounded-full text-base border-none text-gray-500 focus:outline-none"
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {(friends || []).map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-2 mb-2 rounded-lg cursor-pointer flex gap-2 ${
                selectedUser?.id === user.id ? "bg-[#4633A6]" : ""
              }`}
            >
              <div>
                {" "}
                <img
                  src={user?.image}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <p className="font-bold">{user.name}</p>
              {/* <div className="text-sm opacity-80">{user.lastMsg}</div>
              <div className="text-xs text-right">{user.time}</div> */}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white flex flex-col relative">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-[#574CD6] text-xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Start Chat</h1>
              <p>Select a user from the sidebar to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-5 p-4 border-b border-gray-200">
              <div>
                {" "}
                <img
                  src={selectedUser?.image}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className=" font-bold">{selectedUser.name}</div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {(messages || []).map((msg, idx) => {
                const isChatMessage =
                  (msg.senderId === logedInUser?.id &&
                    msg.receiverId === selectedUser?.id) ||
                  (msg.senderId === selectedUser?.id &&
                    msg.receiverId === logedInUser?.id);

                if (!isChatMessage) return null;

                return (
                  <div
                    key={idx}
                    className={`flex mb-2 ${
                      msg.receiverId === logedInUser?.id
                        ? "justify-star "
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`p-2 px-4 rounded-2xl max-w-[60%] ${
                        msg.receiverId === logedInUser?.id
                          ? "bg-[#574CD6] text-white"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      {msg.text}
                      <div className="text-[10px] text-right mt-1 opacity-70">
                        {getDate(msg?.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={messageRef} className="border"></div>
            {/* Input */}
            {typingUserId === selectedUser?.id && (
              <p className="animate-pulse px-5 py-2 text-base">Typing...</p>
            )}
            <div className="p-2 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => handleMessage(e)}
                placeholder="Type a message..."
                className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!message}
                className={`px-6 py-2 text-white ${
                  message ? "bg-[#574CD6]" : "bg-[#948cee] cursor-default "
                }   rounded-full`}
              >
                <IoSend />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
