import React from "react";
import { CgSpinner } from "react-icons/cg";

const SubmitButton = ({
  type,
  onClick,
  loading,
  buttonName,
  disabled,
  className,
  iconColor,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={` ${
        className
          ? className
          : "w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
      }`}
    >
      {loading ? (
        <span
          className={`animate-spin ${iconColor ? iconColor : "text-white"} font-bold`}
        >
          <CgSpinner />
        </span>
      ) : (
        buttonName
      )}
    </button>
  );
};

export default SubmitButton;
