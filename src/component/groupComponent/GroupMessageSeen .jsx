import React from "react";

const GroupMessageSeen = ({
  lastMessageId,
  members,
  //   seenMembers,
  messages,
  type,
  currentUserId,
}) => {
  if (type === "chat") return;
  if (!messages || messages.lenth === 0) return;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.sender?.id !== currentUserId || lastMessage?.deletedForAll)
    return;
  function getLastValidMessage(messages) {
    if (!messages || messages.length === 0) return false;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.userId !== currentUserId) {
      return false;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg?.userId !== currentUserId) return false;
      if (
        msg?.userId === currentUserId &&
        msg?.deletedByMeId !== currentUserId
      ) {
        return true;
      } else {
        continue;
      }
    }
  }
  const lastValidMessage = getLastValidMessage(messages);
  if (!lastValidMessage) return;
  const seenMembers =
    members?.filter(
      (member) =>
        member?.user?.id !== currentUserId &&
        member.lastSeenMessageId >= lastMessageId,
    ) || [];
  if (seenMembers && seenMembers.length === 0) return null;

  return (
    <div className="flex items-center justify-end gap-1.5 pr-1 relative">
      {/* Avatar Stack */}
      <div className="flex -space-x-2 overflow-hidden absolute top-[-20px]">
        {seenMembers.slice(0, 3).map((member) => (
          <div
            key={member.userId}
            title={member.name} // Shows name on hover
            className="h-6 w-6 rounded-full ring-1 relative group ring-white bg-indigo-500 flex items-center justify-center overflow-hidden"
          >
            {member?.user?.image && member?.user?.image.trim() !== "" ? (
              <img
                src={member?.user?.image}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-white uppercase">
                {member?.user?.name?.charAt(0)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Count Label */}
      {/* <span className="text-[10px] font-medium text-gray-400">
        {seenMembers.length > 3 ? `+${seenMembers.length - 3}` : "Seen"}
      </span> */}
    </div>
  );
};

export default GroupMessageSeen;
