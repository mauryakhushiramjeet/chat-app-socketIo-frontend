import { IoTimeOutline, IoCheckmark, IoCheckmarkDone } from "react-icons/io5";

export const MessageStatus = ({ status }) => {
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

export const getGroupMemberName = ({ msg, groupMembers }) => {
  // console.log("groupMembers", groupMembers, "messages", msg);
  const name = groupMembers?.find(
    (m) => Number(m?.user?.id) === Number(msg?.userId),
  );
  return name?.user?.name;
};
