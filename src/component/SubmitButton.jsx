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
    <div className="flex justify-center w-full">
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={` ${
          className
            ? className
            : "px-7 w-fit xs:w-full bg-indigo-600 text-white py-[6px] xs:py-2 lg:py-3 rounded-lg xs:rounded-xl font-semibold lg:font-bold text-base lg:text-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
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
    </div>
  );
};

export default SubmitButton;
