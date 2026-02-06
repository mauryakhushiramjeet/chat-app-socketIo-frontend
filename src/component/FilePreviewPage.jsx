import React from "react";
import {
  AiOutlineDownload,
  AiOutlineClose,
  AiOutlineFileText,
  AiOutlineArrowLeft,
} from "react-icons/ai";

const FilePreviewPage = ({ file, onClose }) => {
  if (!file) return null;

  const canPreview = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "pdf", "txt"].includes(ext);
  };

  const handleDownload = async (file) => {


    const response = await fetch(file.filePath);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden">
      {/* 1. Header (OneDrive Style) */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-4 text-base 2xl:text-[22px]">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
            title="Back"
          >
            <AiOutlineArrowLeft size={20} />
          </button>
          <span className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-[300px]">
            {file.fileName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-base 2xl:text-[22px]">
          <button
            title="download"
            onClick={() => handleDownload(file)}
            className="flex items-center gap-2 px-1 xs:px-4 py-1.5  font-semibold text-[#574CD6] hover:bg-[#574CD6]/10 rounded"
          >
            <span>
              <AiOutlineDownload />
            </span>
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            title="close"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f3f3f3] p-2 sm:p-6 text-center">
        {canPreview(file.fileName) ? (
          /* Case A: Preview Available */
          <div className="w-full h-full flex items-center justify-center">
            <div className="hidden sm:block relative w-full max-w-5xl h-[70vh] sm:h-[80vh] bg-white rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  file.filePath
                )}&embedded=true`}
                className="absolute inset-0 w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
            <div className=" flex sm:hidden flex-col items-center">
            {/* Generic File Icon */}
            <div className="w-24 h-32 bg-white border border-gray-300 rounded-lg flex items-center justify-center mb-6 shadow-sm relative overflow-hidden">
              {/* File fold corner effect */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-gray-100 border-b border-l border-gray-300 rounded-bl-lg"></div>
              <AiOutlineFileText size={48} className="text-[#574CD6]" />
            </div>

            <h2 className="text-base 2xl:text-2xl font-light text-gray-900 mb-2">
              {file.fileName}
            </h2>
           

            <button
              onClick={() => handleDownload(file)}
              className="bg-[#574CD6]/90 text-base 2xl:text-lg text-white px-8 2xl:px-10 py-2 font-medium hover:bg-[#574CD6] transition-colors rounded-lg shadow-md"
            >
              Download
            </button>
          </div>
          </div>
        ) : (
          /* Case B: No Preview (OneDrive Fallback UI) */
          <div className="flex flex-col items-center">
            {/* Generic File Icon */}
            <div className="w-24 h-32 bg-white border border-gray-300 rounded-lg flex items-center justify-center mb-6 shadow-sm relative overflow-hidden">
              {/* File fold corner effect */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-gray-100 border-b border-l border-gray-300 rounded-bl-lg"></div>
              <AiOutlineFileText size={48} className="text-[#574CD6]" />
            </div>

            <h2 className="text-base 2xl:text-2xl font-light text-gray-900 mb-2">
              {file.fileName}
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm 2xl:text-xl">
              Hmm... looks like this file doesn't have a preview we can show
              you.
            </p>

            <button
              onClick={() => handleDownload(file)}
              className="bg-[#574CD6]/90 text-base 2xl:text-lg text-white px-8 2xl:px-10 py-2 font-medium hover:bg-[#574CD6] transition-colors rounded-lg shadow-md"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewPage;
