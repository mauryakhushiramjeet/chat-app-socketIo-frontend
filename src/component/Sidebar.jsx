import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoSearch } from "react-icons/go";
import {
  getConversationsUsers,
  updateProfileThunk,
} from "../store/actions/userActions";
import {
  FaCheck,
  FaCamera,
  FaArrowLeft,
  FaPencilAlt,
  FaUsers,
} from "react-icons/fa"; // Added FaUsers
import { MdGroupAdd } from "react-icons/md"; // Added MdGroupAdd
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../store/actions/groupAction";
import { getSidebarChatList } from "../store/actions/sidebarChatListActions";
import Profile from "./Profile";

const Sidebar = ({
  logedInUser,
  setSelectedUser,
  selectedUser,
  socket,
  setLogedInUser,
  onlineUsers,
  setShowUserChat,
}) => {
  const [searchText, setSearchText] = useState("");
  const [seratchingUser, setSearchingUser] = useState([]);
  const [users, setUsers] = useState([]);

  // --- Group States ---
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupImage, setGroupImage] = useState({ image: "", file: null });
  const groupFileInputRef = useRef(null);
  const usersRef = useRef([]);

  const [initialProfile, setInitialProfile] = useState({
    name: logedInUser?.name,
    about: "Available",
    image: logedInUser?.image,
  });

  const [profile, setProfile] = useState({
    name: logedInUser?.name || "",
    about: "Available",
    image: logedInUser?.image || "",
    file: "",
  });
  const sidebarChatListStore = useSelector((store) => store.sidebarChatList);
  const [showProfile, setShowProfile] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const storeFriends = useSelector((store) => store.friends);
  const dispatch = useDispatch();
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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, image: imageUrl, file: file }));
    }
  };

  const handleGroupImageClick = () => groupFileInputRef.current.click();

  const handleGroupFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage({ image: URL.createObjectURL(file), file: file });
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === "")
      return toast.error("Please enter a group name");
    if (logedInUser) {
      selectedMembers.push(logedInUser?.id);
    }
    if (selectedMembers.length < 2)
      return toast.error("Select at least 2 members");

    const formData = new FormData();
    formData.append("groupName", groupName);
    selectedMembers.forEach((m) => {
      formData.append("selectedMembers[]", m);
    });
    formData.append("image", groupImage?.file);
    formData.append("groupCreatedUserId", logedInUser?.id);

    dispatch(createGroup(formData))
      .unwrap()
      .then((res) => {
        // console.log(res);
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchingUser(null);
      return;
    }
    if (!friends) return;
    const allUserCopy = [...friends];
    const filterUsers = allUserCopy.filter((user) =>
      user?.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );
    setSearchingUser(filterUsers);
  }, [searchText, friends]);

  useEffect(() => {
    if (!logedInUser) return;
    setProfile((prev) => ({
      ...prev,
      name: logedInUser?.name,
      about: logedInUser?.about ?? "Avalable",
      image: logedInUser?.image,
    }));
    setInitialProfile((prev) => ({
      ...prev,
      name: logedInUser?.name,
      about: logedInUser?.about ?? "Avalable",
      image: logedInUser?.image,
    }));
    dispatch(getSidebarChatList({ loggedInUserId: logedInUser?.id }));
  }, [logedInUser, dispatch]);

  const getSidebarLastMessage = (item) => {
    if (
      item?.lastMessage?.trim() === "" &&
      item?.lastMessageCreatedAt == null
    ) {
      return null;
    }
    if (
      item?.lastMessage?.trim() === "" &&
      item?.lastMessageCreatedAt !== null
    ) {
      return "Send a file";
    }
    if (item.lastMessage?.trim() !== "") {
      return item.lastMessage;
    }
    return "Tap to chat";
  };
  useEffect(() => {
    if (!sidebarChatListStore?.isError && !sidebarChatListStore?.isLoading) {
      // console.log(
      //   sidebarChatListStore?.chatList?.sidebarchatsAndGroupConverstions,
      // );
      const normalizedUsers = (
        sidebarChatListStore?.chatList?.sidebarchatsAndGroupConverstions || []
      ).map((item) => {
        return {
          id: item.type === "group" ? `group-${item.id}` : item.chatUser?.id,
          mainId: item.id,
          type: item.type,
          name: item.type === "group" ? item.name : item.chatUser?.name,
          image: item.type === "group" ? item.groupImage : item.chatUser?.image,
          lastMessage: getSidebarLastMessage(item),

          lastMessageId: item.lastMessageId,
          LastActiveAt:
            item.type === "group" ? null : item.chatUser?.LastActiveAt,
          lastMessageCreatedAt: item.lastMessageCreatedAt || null,
        };
      });

      setUsers(normalizedUsers);
    }
  }, [sidebarChatListStore]);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);
  useEffect(() => {
    if (!socket) return;

    socket.on(
      "newMessage",
      ({ response, targetChatUserId, conversationId, type, lastMessageId }) => {
        // console.log("mnasbjhga");
        // console.log(
        //   "new message",
        //   response,
        //   "targetListId",
        //   targetChatUserId,
        //   conversationId,
        //   type,
        //   lastMessageId
        // );
        // console.log("conversationId", conversationId);
        // console.log(lastMessageId, "lastmessageId");
        setUsers((prevUsers) => {
          const conversationIndex = prevUsers.findIndex(
            (item) =>
              String(item.id) === String(targetChatUserId) &&
              item.type === type,
          );
          // console.log(conversationIndex, "index");
          if (conversationIndex !== -1) {
            const updatedUsers = [...prevUsers];
            updatedUsers[conversationIndex] = {
              ...updatedUsers[conversationIndex],
              lastMessage:
                response.text.trim() === "" ? "Send a file" : response.text,
              lastMessageCreatedAt: new Date(),
              lastMessageId,
            };
            return updatedUsers;
          } else {
            if (type === "group") return;
            // console.log("new chat created here");
            return [
              {
                id: targetChatUserId,
                type: type,
                mainId: conversationId.id,
                name: conversationId.chatUser.name,
                image: conversationId.chatUser.image,
                lastMessage: response.text,
                lastMessageId,
                lastMessageCreatedAt: new Date(),
              },
              ...prevUsers,
            ];
          }
        });
      },
    );

    socket.on("groupCreate", ({ id, name, image, members }) => {
      setUsers((prev) => [
        ...prev,
        {
          id: `group-${id}`,
          type: "group",
          name,
          image,
          lastMessage: "",
          lastMessageCreatedAt: null,
        },
      ]);
      setShowGroupCreate(false);
      setSearchingUser([]);
      setGroupImage({ image: "", file: null });
      setGroupName(null);
    });
    socket.on(
      "receiveGropMessage",
      ({ groupId, message, lastMessageId, file }) => {
        console.log(
          "new group message is receive",
          message,
          "message id is",
          lastMessageId,
        );
        setUsers((prev) =>
          prev.map((group) =>
            String(group.id) === String(groupId)
              ? {
                  ...group,
                  lastMessageId: lastMessageId,
                  lastMessage: message.trim() === "" ? "Send a file" : message,
                  file: file.length > 0 ? file : null,
                  lastMessageCreatedAt: new Date(),
                }
              : group,
          ),
        );
      },
    );
    socket.on(
      "sidebar:update",
      ({
        lastMessage,
        sidebarChatId,
        type,
        lastMessageId,
        lastMessageCreatedAt,
        deleteType,
      }) => {
        console.log("mainId", sidebarChatId, "last message,", lastMessage);
        console.log(
          "gated sidebar update signal for",
          deleteType,
          "type",
          lastMessage,
          sidebarChatId,
          type,
          lastMessageId,
          lastMessageCreatedAt,
          deleteType,
        );
        if (deleteType === "For_Everypone") {
          const users = usersRef.current;
          console.log(users);
          const lastmessageList = users.find(
            (msg) => msg?.mainId === sidebarChatId,
          );
          console.log(
            "lastmessages list",
            lastmessageList,
            "and the messges deleted id is:",
            lastMessageId,
          );
          if (!lastmessageList) return;
        }
        setUsers((prev) =>
          prev.map((chatList) =>
            chatList.mainId === sidebarChatId && chatList.type === type
              ? {
                  ...chatList,
                  lastMessage:
                    lastMessage.trim() === "" && lastMessageCreatedAt === null
                      ? ""
                      : lastMessage.trim() === "" &&
                          lastMessageCreatedAt !== null
                        ? "Send a File"
                        : lastMessage?.trim() !== ""
                          ? lastMessage
                          : "Start conversation",
                  lastMessageCreatedAt: new Date(),
                  lastMessageId: lastMessageId,
                }
              : chatList,
          ),
        );
      },
    );
  }, [socket, logedInUser]);
  // console.log(users);
  const sortedUsers = useMemo(() => {
    if (!users) return;
    return [...users].sort((a, b) => {
      return (
        new Date(b.lastMessageCreatedAt) - new Date(a.lastMessageCreatedAt)
      );
    });
  }, [users]);

  const upadteProfileImage = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profile?.name);
      formData.append("userId", logedInUser?.id);
      formData.append("image", profile?.file);
      formData.append("about", profile?.about);
      dispatch(updateProfileThunk(formData))
        .unwrap()
        .then((res) => {
          if (res.success) {
            toast.success(res.message);
            localStorage.setItem("userData", JSON.stringify(res?.user));
            navigate("/chat");
          } else {
            toast.error(res.message);
          }
        });
    } catch (err) {
      console.log(err, "profile update error");
    }
  };

  const getDate = (date) => {
    const now = new Date(date);
    const hours24 = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  const isChanged = useMemo(() => {
    return (
      profile.name !== initialProfile.name ||
      profile.about !== initialProfile.about ||
      profile.image !== initialProfile.image
    );
  }, [profile, initialProfile]);

  useEffect(() => {
    if (!socket) return;
    socket.on("profile:updated", (data) => {
      const { userId, name, about, image } = data;
      if (logedInUser?.id === userId) {
        setLogedInUser((prev) => ({
          ...prev,
          name: name,
          about: about,
          image: image,
        }));
      }
      setUsers((prev) =>
        prev.map((user) =>
          user?.chatUser?.id === userId
            ? {
                ...user,
                chatUser: {
                  ...user.chatUser,
                  name: name,
                  about: about,
                  image: image,
                },
              }
            : user,
        ),
      );
    });

    socket.on("profile:error", (message) => {
      alert(message);
    });

    return () => {
      socket.off("profile:updated");
    };
  }, [socket, logedInUser]);
  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };
  // console.log(onlineUsers, "online users");

  const handleUserChatSelect = (userCoversation) => {
    setSelectedUser(userCoversation);
    setShowUserChat(true);
  };
  return (
    <div className="w-full bg-[#574CD6] text-white flex flex-col h-screen border-r border-white/10 shadow-2xl relative overflow-hidden">
      {/* create group section */}
      <div
        className={`absolute inset-0 bg-[#574CD6] z-[70] transition-transform duration-300 ease-in-out ${
          showGroupCreate ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 lg:p-5 flex items-center gap-4 bg-[#4633A6]/40 border-b border-white/10 text-sm 2xl:text-lg 3xl:text-2xl ">
          <button
            onClick={() => {
              setShowGroupCreate(false);
              setSearchingUser([]);
              setGroupImage({ image: "", file: null });
              setGroupName(null);
            }}
            className="hover:bg-white/10 rounded-full"
          >
            <FaArrowLeft />
          </button>
          <p className="3xl:font-bold">Create Group</p>
        </div>

        <div className="p-4 lg:p-6 flex flex-col h-[calc(100%-80px)]">
          {/* Group Icon & Name */}
          <div className="flex flex-col items-center mb-3 3xl:mb-6">
            <div
              className="relative group cursor-pointer"
              onClick={handleGroupImageClick}
            >
              <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
                {groupImage.image ? (
                  <img
                    src={groupImage.image}
                    className="w-full h-full object-cover"
                    alt="group-image"
                  />
                ) : (
                  <FaUsers className="text-4xl text-white/40" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera className="text-white text-xl" />
              </div>
              <input
                type="file"
                ref={groupFileInputRef}
                className="hidden"
                onChange={handleGroupFileChange}
                accept="image/*"
              />
            </div>

            <input
              type="text"
              placeholder="Enter group name"
              className="mt-4 w-full bg-transparent border-b border-white/20 py-2 outline-none text-center font-bold placeholder:text-white/40 text-sm 2xl:text-base 3xl:text-2xl"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Grop created member heres */}
          <p className="text-xs 2xl:text-sm 3xl:text-xl font-bold uppercase tracking-widest text-white/40 mb-3">
            Select Members
          </p>
          <div className="flex flex-col flex-1 gap-1 2xl:gap-3  overflow-y-auto sidebar-scroll  pr-2">
            {friends?.map((friend) => (
              <div
                key={friend.id}
                onClick={() => toggleMember(friend.id)}
                className={`flex items-center gap-3 2xl:gap-3 p-1 2xl;p-2 rounded-xl cursor-pointer transition-all ${
                  selectedMembers.includes(friend.id)
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <Profile
                    getdefaultProfile={getdefaultProfile}
                    selectedUser={friend}
                  />
                </div>
                <span className="text-sm 2xl:text-xl 3xl:text-[22px] flex-1 truncate">
                  {friend.name}
                </span>
                <div
                  className={`w-4 h-4 2xl:h-8 2xl:w-8 rounded-full border flex items-center justify-center ${
                    selectedMembers.includes(friend.id)
                      ? "bg-green-500 border-green-500"
                      : "border-white/30"
                  }`}
                >
                  {selectedMembers.includes(friend.id) && (
                    <FaCheck className="text-lg" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateGroup}
            className="mt-4 w-full bg-white text-[#574CD6] py-2 3xl:py-3 rounded-xl font-medium 3xl:font-bold shadow-lg active:scale-95 transition-all text-sm 2xl:text-base 3xl:text-lg"
          >
            Create Group ({selectedMembers.length})
          </button>
        </div>
      </div>

      {/* {profilev} */}
      <div
        className={`absolute inset-0 bg-[#574CD6] z-[60] transition-transform duration-300 ease-in-out ${
          showProfile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-3 sm:px-8 md:px-4 py-4 lg:px-5 lg:py-5 flex items-center gap-4 md:gap-2 3xl:gap-4 bg-[#4633A6]/40 border-b border-white/10 text-sm xl:text-lg 3xl:text-2xl">
          <button
            onClick={() => setShowProfile(false)}
            className="hover:bg-white/10 rounded-full"
          >
            <FaArrowLeft />
          </button>
          <p className="3xl:font-bold">Profile</p>
        </div>

        <div className="p-3 sm:p-8 md:p-4 lg:p-8 flex flex-col items-center">
          <div
            className="relative group cursor-pointer"
            onClick={handleImageClick}
          >
            <div className="w-28 xl:w-32 2xl:w-40 h-28 xl:h-32 2xl:h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
              {profile?.image ? (
                <img
                  src={profile?.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <span className="text-[#574CD6] text-4xl 2xl:text-5xl font-black">
                    {getdefaultProfile(logedInUser?.name)}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera className="text-white text-3xl mb-1" />
              <span className="text-[10px] 2xl:text-base uppercase font-bold text-white">
                Change Photo
              </span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />

          <div className="mt-8 w-full">
            <label className="text-xs 2xl:text-lg text-white/50 uppercase tracking-widest font-bold">
              Your Name
            </label>
            <div className="flex justify-between items-center mt-2 border-b border-white/20 pb-2">
              <input
                type="text"
                className="text-sm 2xl:text-lg outline-none bg-transparent font-medium"
                value={profile?.name}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <FaPencilAlt className="text-white/40 cursor-pointer hover:text-white" />
            </div>
          </div>

          <div className="mt-[10px] w-full">
            <label className="text-xs 2xl:text-lg text-white/50 uppercase tracking-widest font-bold">
              About
            </label>
            <div className="flex justify-between items-center mt-2 border-b border-white/20 pb-2">
              <input
                type="text"
                className="text-sm 2xl:text-lg outline-none font-medium bg-transparent"
                value={profile?.about}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    about: e.target.value,
                  }))
                }
              />
              <FaPencilAlt className="text-white/40 cursor-pointer hover:text-white" />
            </div>
          </div>
          <div className="mt-10 w-full px-2 text-sm 3xl:text-lg flex flex-col items-center">
            <button
              onClick={() => upadteProfileImage()}
              disabled={!isChanged}
              className={`w-[200px]  md:w-full px-8 md:px-0 ${
                isChanged ? "bg-gray-100 hover:bg-gray-100" : "bg-gray-100/50"
              }  text-[#574CD6] py-2 md:py-[6px] rounded-xl font-medium 2xl:font-bold  shadow-lg  active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              Save Changes
            </button>
            <button
              onClick={() => handleLogout()}
              className={`w-[200px]  md:w-full px-8 md:px-0 
                 bg-red-500/90 hover:bg-red-700  mt-3
              text-white py-2 md:py-[6px] rounded-xl font-medium 2xl:font-bold shadow-lg  active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* --- SIDER HEADER --- */}
      <div
        onClick={() => setShowProfile(true)}
        className="px-3 sm:px-8 md:px-5 py-5 flex items-center gap-3 bg-[#4633A6]/40 border-b border-white/10 cursor-pointer hover:bg-[#4633A6]/60 transition-all group"
      >
        <div className="relative shrink-0">
          <Profile
            getdefaultProfile={getdefaultProfile}
            selectedUser={logedInUser}
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <FaPencilAlt className="text-[#574CD6] text-[8px]" />
          </div>
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-sm xs:text-base lg:text-lg 2xl:text-[22px] 3xl:text-2xl leading-tight truncate">
            {logedInUser?.name}
          </p>
          <p className="text-xs 2xl:text-base text-white/50 mt-1">
            Click to view profile
          </p>
        </div>
      </div>

      {/* search div for serach users */}
      <div className="p-3 sm:p-8 md:p-4 relative ">
        <div className="relative group text-sm 2xl:text-lg 3xl:text-xl">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search conversations..."
            className="w-full py-2 px-4 pr-10 rounded-xl bg-white/10 border border-white/10 placeholder:text-white/50 focus:outline-none focus:bg-white focus:text-gray-800  transition-all duration-300 "
          />
          <span className="absolute right-3 top-2.5 text-white/50 group-focus-within:text-gray-400">
            <GoSearch />
          </span>
        </div>

        {searchText.trim() !== "" && (
          <div className="absolute left-4 right-4 mt-2 max-h-60 2xl:max-h-[350px] overflow-y-auto z-50 rounded-xl bg-white shadow-2xl sidebar-scroll">
            {seratchingUser?.length > 0 ? (
              seratchingUser.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUser({ ...user, type: "chat" });
                    setSearchText("");
                    if (window.innerWidth <= 768) {
                      setShowUserChat(true);
                    }
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  {/* <div className="relative w-8 h-8  bg-gray-200 flex items-center justify-center overflow-hidden"> */}
                  {/* {user.image ? (
                      <img
                        src={user.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="text-[#574CD6] text-[10px] font-bold">
                        {getdefaultProfile(user.name)}
                      </span>
                    )} */}
                  <Profile
                    getdefaultProfile={getdefaultProfile}
                    selectedUser={user}
                  />
                  {/* </div> */}
                  <p className="text-gray-800 font-semibold text-sm 2xl:text-xl">
                    {user.name}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-2 lg:p-3 xl:p-4 text-gray-400 text-xs xl:text-lg  2xl:text-xl text-center">
                No users found
              </p>
            )}
          </div>
        )}
      </div>

      {/* {conversation loist} */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3 sm:px-8 md:px-2 lg:px-3 pb-4">
        {/* Header with Group Create Button */}
        <div className="flex justify-between items-center px-2 mb-3 2xl:mb-5 3xl:mb-9 text-xs 2xl:text-sm 3xl:text-lg">
          <h3 className="font-bold uppercase tracking-widest text-white/40">
            Recent Messages
          </h3>
          <button
            onClick={() => setShowGroupCreate(true)}
            className="sm:p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
            title="Create New Group"
          >
            <MdGroupAdd className="text-white/60 group-hover:text-white text-2xl" />
          </button>
        </div>

        {(sortedUsers || []).map((userCoversation) => (
          <div
            key={userCoversation.id}
            onClick={() => handleUserChatSelect(userCoversation)}
            className={`flex items-center gap-4 sm:gap-7 md:gap-3 p-2 lg:p-3 mb-1 rounded-2xl cursor-pointer user-item-transition group ${
              selectedUser?.id === userCoversation?.id
                ? "bg-white text-[#a69efa] shadow-lg"
                : "hover:bg-white/10"
            }`}
          >
            <div className="relative">
              {/* {userCoversation?.image ? (
                <img
                  src={userCoversation?.image}
                  className={`w-12 h-12 rounded-full border-2 object-cover ${
                    selectedUser?.id === userCoversation?.chatUser?.id
                      ? "border-[#574CD6]/20"
                      : "border-white/10"
                  }`}
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    selectedUser?.id === userCoversation?.id
                      ? "bg-[#574CD6] text-white"
                      : "bg-white/20"
                  }`}
                >
                  {getdefaultProfile(userCoversation?.name)}
                </div>
              )} */}
              <Profile
                getdefaultProfile={getdefaultProfile}
                selectedUser={userCoversation}
                className="border-none"
              />
              {onlineUsers.includes(String(userCoversation?.id)) && (
                <div className="absolute bottom-0 right-0 w-[15px] h-[15px] rounded-full bg-green-500 flex items-center justify-center border-2 border-[#574CD6]">
                  <FaCheck className="text-[8px] text-gray-900" />
                </div>
              )}
            </div>

            <div className=" flex-1 min-w-0">
              <p
                className={`sm:font-semibold truncate text-sm 2xl:text-base 3xl:text-xl ${
                  selectedUser?.id === userCoversation?.id
                    ? "text-[#574CD6]"
                    : "text-white"
                }`}
              >
                {userCoversation?.name}
              </p>
              <div className="flex gap-3 justify-between items-center text-xs xl:text-sm 3xl:text-lg 2xl:mt-2 3xl:mt-3">
                <p
                  className={`truncate ${
                    selectedUser?.id === userCoversation?.id
                      ? "text-[#574CD6]/80"
                      : "text-white/50"
                  }`}
                >
                  {userCoversation?.lastMessage}
                </p>
                {userCoversation?.lastMessageCreatedAt && (
                  <p className="opacity-70 ml-2 shrink-0 text-xs 2xl:text-sm 3xl:text-lg">
                    {getDate(userCoversation?.lastMessageCreatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
