import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoSearch } from "react-icons/go";
import { getConversationsUsers } from "../store/actions/userActions";
import { FaCheck } from "react-icons/fa";

const Sidebar = ({
  logedInUser,
  setSelectedUser,
  selectedUser,
  socket,
  onlineUsers,
}) => {
  const [searchText, setSearchText] = useState("");
  const [seratchingUser, setSearchingUser] = useState([]);
  const [users, setUsers] = useState([]);
  const storeFriends = useSelector((store) => store.friends);
  const dispatch = useDispatch();
  const usersStore = useSelector((store) => store.conversationUser);
  const friends = useMemo(() => {
    return storeFriends?.user?.friends;
  }, [storeFriends]);

  const getdefaultProfile = (name) => {
    if (!name) return "";
    const spiltName = name.split(" ");
    return spiltName.length > 1
      ? `${spiltName[0][0]}${spiltName[1][0]}`.toUpperCase()
      : `${spiltName[0][0]}`.toUpperCase();
  };

  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchingUser(null);
      return;
    }
    if (!friends) return;
    const allUserCopy = [...friends];
    const filterUsers = allUserCopy.filter((user) =>
      user?.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
    );
    setSearchingUser(filterUsers);
  }, [searchText, friends]);
  useEffect(() => {
    if (!logedInUser) return;
    const loggedInUserId = logedInUser?.id;

    dispatch(getConversationsUsers(loggedInUserId));
  }, [logedInUser]);
  useEffect(() => {
    if (!usersStore?.isError && !usersStore?.isLoading) {
      setUsers(usersStore?.conversationUser?.formatedCobnversation || []);
    }
  }, [usersStore]);
  useEffect(() => {
    if (!socket) return;

    // const handleNewMessage = ({ response, conversationId }) => {
    //   console.log("new message for conversation upadte  is getted....");

    // };

    // socket.on("newMessage", { handleNewMessage });
    socket.on("newMessage", ({ response, conversationId }) => {
      console.log("new message for conversation update is getted....");
      setUsers((prevUsers) => {
        const conversationIndex = prevUsers.findIndex(
          (item) => item.id === conversationId.id
        );
        if (conversationIndex !== -1) {
          const updatedUsers = [...prevUsers];

          updatedUsers[conversationIndex] = {
            ...updatedUsers[conversationIndex],
            lastMessage: response.text,
            lastMessageCreatedAt: new Date(),
          };

          return updatedUsers;
        }
        return [
          {
            id: conversationId.id,
            currentUserId: logedInUser.id,
            chatUserId: conversationId.chatUser.id,
            chatUser: {
              name: conversationId.chatUser.name,
              image: conversationId.chatUser.image,
              id: conversationId.chatUser?.id,
            },
            lastMessage: response.text,
            lastMessageCreatedAt: new Date(),
          },
          ...prevUsers,
        ];
      });
    });
  }, [socket, logedInUser]);
// 
  // console.log(selectedUser);
  const sortedUsers = useMemo(() => {
    if (!users) {
      return;
    }
    return [...users].sort((a, b) => {
      return (
        new Date(b.lastMessageCreatedAt) - new Date(a.lastMessageCreatedAt)
      );
    });
  }, [users]);
  const getDate = (date) => {
    const now = new Date(date);
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
  };
  return (
    <div className="w-80 bg-[#574CD6] text-white flex flex-col h-screen border-r border-white/10 shadow-2xl">
      {/* Logged-in User Section */}
      <div className="p-5 flex items-center gap-3 bg-[#4633A6]/40 border-b border-white/10">
        <div className="shrink-0">
          {logedInUser?.image && logedInUser.image.trim() !== "" ? (
            <img
              src={logedInUser.image}
              alt="Me"
              className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-inner">
              <p className="text-[#574CD6] font-black text-sm">
                {getdefaultProfile(logedInUser?.name)}
              </p>
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-lg leading-tight truncate">
            {logedInUser?.name}
          </p>
        </div>
      </div>

      {/* Search Container */}
      <div className="p-4 relative">
        <div className="relative group">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search conversations..."
            className="w-full py-2.5 px-4 pr-10 rounded-xl bg-white/10 border border-white/10 text-sm placeholder:text-white/50 focus:outline-none focus:bg-white focus:text-gray-800 transition-all duration-300"
          />
          <span className="absolute right-3 top-2.5 text-white/30 group-focus-within:text-gray-400">
            <GoSearch />
          </span>
        </div>

        {searchText.trim() !== "" && (
          <div className="absolute left-4 right-4 mt-2 max-h-60 overflow-y-auto z-50 rounded-xl search-results-glass sidebar-scroll">
            {seratchingUser?.length > 0 ? (
              seratchingUser.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchText("");
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-[#574CD6]/10 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="relative w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img
                        src={user.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#574CD6] text-[10px] font-bold">
                        {getdefaultProfile(user.name)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 font-semibold text-sm">
                    {user.name}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-400 text-xs text-center">
                No users found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3 pb-4">
        <h3 className="px-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
          Recent Messages
        </h3>

        {(sortedUsers || []).map((userCoversation) => (
          <div
            key={userCoversation.id}
            onClick={() => setSelectedUser(userCoversation?.chatUser)}
            className={`flex items-center gap-3 p-3 mb-1 rounded-2xl cursor-pointer user-item-transition group ${
              selectedUser?.id === userCoversation?.chatUser?.id
                ? "bg-white text-[#574CD6] shadow-lg"
                : "hover:bg-white/10"
            }`}
          >
            <div className="relative shrink-0">
              {userCoversation?.chatUser?.image &&
              userCoversation?.chatUser?.image.trim() !== "" ? (
                <img
                  src={userCoversation?.chatUser?.image}
                  alt="User"
                  className={`w-12 h-12 rounded-full border-2 object-cover ${
                    selectedUser?.id === userCoversation?.chatUser?.id
                      ? "border-[#574CD6]/20"
                      : "border-white/10"
                  }`}
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    selectedUser?.id === userCoversation?.chatUser?.id
                      ? "bg-[#574CD6] text-white"
                      : "bg-white/20"
                  }`}
                >
                  {getdefaultProfile(userCoversation?.chatUser?.name)}
                </div>
              )}
              {onlineUsers.includes(String(userCoversation?.chatUser?.id)) && (
                <div className="absolute bottom-0 right-0 w-[15px] h-[15px]  rounded-full bg-green-500 flex items-center justify-center">
                  <FaCheck className="text-[8px] text-gray-900" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`font-bold truncate ${
                  selectedUser?.id === userCoversation?.chatUser?.id
                    ? "text-[#574CD6]"
                    : "text-white"
                }`}
              >
                {userCoversation?.chatUser?.name}
              </p>
              <p
                className={`text-xs truncate ${
                  selectedUser?.id === userCoversation?.chatUser?.id
                    ? "text-[#574CD6]/60"
                    : "text-white/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <p>
                    {userCoversation?.lastMessage
                      ? userCoversation?.lastMessage
                      : " Tap to chat "}
                  </p>
                  <p>{getDate(userCoversation?.lastMessageCreatedAt)}</p>
                </div>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
