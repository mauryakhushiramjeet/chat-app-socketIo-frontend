import React, { useContext } from "react";
import { ProfileContext } from "../../utills/context/ProfileContext";

const ProfileImageViewModel = () => {
  const { viewProfileImage, setViewProfileImage } = useContext(ProfileContext);
  if (!viewProfileImage) return;
  return (
    <div
      onClick={() => setViewProfileImage(null)}
      className="inset-0 bg-black/90 absolute flex items-center justify-center z-[75]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-[400px] w-[400px]  bg-gray-700"
      >
        <img
          src={viewProfileImage}
          alt="profile-view"
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

export default ProfileImageViewModel;
