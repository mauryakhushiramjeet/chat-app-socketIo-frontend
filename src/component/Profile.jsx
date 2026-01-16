import React from "react";

const Profile = ({ getdefaultProfile, selectedUser, className }) => {
  console.log(className);
  return (
    <div className="w-[35px] sm:w-[50px] md:w-[35px] 2xl:w-[50px] 3xl:w-[65px] h-[35px] sm:h-[50px] md:h-[35px] 2xl:h-[50px] 3xl:h-[65px]">
      {" "}
      {selectedUser?.image && selectedUser.image.trim() !== "" ? (
        // <div className="w-[60px] h-[60px]">
        <img
          src={selectedUser.image}
          alt="User"
          className={`h-full w-full rounded-full object-cover ring-2 ring-gray-50  ${className}`}
        />
      ) : (
        // </div>
        <div
          className={`h-full w-full  rounded-full bg-indigo-50 flex items-center justify-center text-[#574CD6] font-bold border border-indigo-100 text-2xl  ${className}`}
        >
          {getdefaultProfile(selectedUser?.name)}
        </div>
      )}
    </div>
  );
};

export default Profile;
