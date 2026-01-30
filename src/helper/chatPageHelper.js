import {
  IoTimeOutline,
  IoCheckmark,
  IoCheckmarkDone,
} from "react-icons/io5";

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

export default MessageStatus;