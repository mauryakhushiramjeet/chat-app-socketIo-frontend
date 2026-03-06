import React, { useContext, useEffect, useRef } from "react";
import { NotificationContext } from "../../utills/context/NotificationContext";
import { unBlockUser } from "../../store/actions/blockActions";
import { useDispatch } from "react-redux";

const UnblockModal = ({
  openUnblockModel,
  setOpenUnblockModel,
  userName,
  loggedUser,
  selectedUser,
}) => {
  const modalRef = useRef(null);
  const { setBlockedUsers, blockedUsers } = useContext(NotificationContext);
  const dispatch = useDispatch();
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        openUnblockModel(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openUnblockModel]);

  const handleUnblockUser = () => {
    console.log("unblock user", {
      blockerId: loggedUser.id,
      blockedId: selectedUser.id,
    });
    dispatch(
      unBlockUser({ blockerId: loggedUser.id, blockedId: selectedUser.id }),
    )
      .unwrap()
      .then((res) => {
        console.log(res);
        setBlockedUsers(
          blockedUsers.filter((b) => b?.blocked_user_id !== selectedUser?.id),
        );
        setOpenUnblockModel(false)
      })
      .catch((err) => console.log(err));
  };
  if (!openUnblockModel) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200"
      >
        <div className="p-6">
          {/* Title */}
          <h3 className="text-gray-800 text-[18px] font-semibold mb-3">
            Unblock {userName}?
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-6">
            If you unblock this contact, you will be able to send and receive
            messages again.
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setOpenUnblockModel(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              onClick={() => handleUnblockUser()}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Unblock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnblockModal;
