import { createContext, useState } from "react";

export const ProfileContext = createContext(null);
export const ProfileContextProvider = ({ children }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [viewProfileImage, setViewProfileImage] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState({
    showSelectedUserProfile: false,
    name: "",
    bio: "",
    image: null,
    isImage: false,
  });

  return (
    <ProfileContext.Provider
      value={{
        showProfile,
        setShowProfile,
        viewProfileImage,
        setViewProfileImage,
        selectedUserProfile,
        setSelectedUserProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
