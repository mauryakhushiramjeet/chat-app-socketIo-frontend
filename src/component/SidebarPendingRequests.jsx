import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  acceptChatRequest,
  getPendingReuests,
} from "../store/actions/sidebarRequestActions";
import { FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
// Assuming you have an accept action, if not, create one
// import { acceptChatRequest } from "../store/actions/sidebarRequestActions";

const SidebarPendingRequests = ({ socket, logedInUser, setUsers }) => {
  const [pendingRequests, setPendingRequestes] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    socket.on("chatRequest", ({ senderName, conversationId }) => {
      console.log("get request", senderName, conversationId);
      setPendingRequestes((prev) => {
        const requestExists = prev.some(
          (req) => req.conversationId === conversationId,
        );
        if (requestExists) return prev;
        return [{ senderName, conversationId }, ...prev];
      });
    });

    return () => socket.off("chatRequest");
  }, [socket]);

  useEffect(() => {
    if (logedInUser?.id) {
      dispatch(getPendingReuests({ loggedInUserId: logedInUser?.id }))
        .unwrap()
        .then((res) => {
          if (res.success) {
            // console.log(res, "res ponse of pending reuest");
            setPendingRequestes(res?.myAllPendingRequest || []);
          }
        })
        .catch((err) => console.log(err));
    }
  }, [logedInUser, dispatch]);

  const handleAccept = (conversationId) => {
    console.log(conversationId);
    dispatch(
      acceptChatRequest({ conversationId, loggedInUserId: logedInUser?.id }),
    )
      .unwrap()
      .then((res) => {
        console.log(res);
        if (res.success) {
          const {
            id,
            type,
            chatUser,
            lastMessage,
            lastMessageId,
            lastMessageCreatedAt,
          } = res.formateAcceptedUserSideList;
          console.log(
            id,
            type,
            chatUser,
            lastMessage,
            lastMessageId,
            lastMessageCreatedAt,
            "detailes",
          );
          setUsers((prevUsers) => [
            {
              id: id,
              type: type,
              mainId: conversationId.id,
              name: chatUser.name,
              image: chatUser.image,
              lastMessage,
              lastMessageId,
              status: null,
              lastMessageCreatedAt,
            },
            ...prevUsers,
          ]);
          setPendingRequestes((prev) =>
            prev.filter((req) => req.conversationId !== conversationId),
          );
        }
      });
  };

  if (pendingRequests.length === 0) return null;

  return (
    <div className="px-3 sm:px-8 md:px-2 lg:px-3 mb-4">
      <div
        className="flex justify-between items-center px-2 mb-2 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xs 2xl:text-sm uppercase  tracking-widest text-white/40">
            Pending Requests
          </h3>
          <span className="bg-[#16A34A] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {pendingRequests.length}
          </span>
        </div>
        <button className="text-white/40 text-xs">
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto sidebar-scroll pr-1">
          {pendingRequests.map((request) => (
            <div
              key={request.conversationId}
              className="flex items-center justify-between gap-3 p-3 bg-white/10 rounded-2xl border border-white/5 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center shrink-0 shadow-lg">
                  <FaUserPlus className="text-white text-sm" />
                </div> */}
                <div className="truncate">
                  <p className="truncate text-sm 2xl:text-base 3xl:text-xl transition-all font-medium text-white/80">
                    {request.senderName}
                  </p>
                  <p className="text-[11px] text-white/50">Wants to chat</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.conversationId)}
                  className="px-2 py-1 bg-gray-300 rounded-xl text-[#574CD5] font-bold text-sm shadow-lg transition-transform active:scale-500 hover:bg-gray-100"
                  title="Accept"
                >
                  {/* <FaCheck size={12} /> */}
                  <FaUserPlus />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-[1px] bg-white/10 mt-4 mx-2" />
    </div>
  );
};

export default SidebarPendingRequests;
