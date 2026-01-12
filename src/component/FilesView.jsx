import React, { useEffect, useRef, useState } from "react";
import { AiOutlineFile } from "react-icons/ai";
import { FaPlayCircle } from "react-icons/fa";
import { FaPauseCircle } from "react-icons/fa";

const FilesView = ({ msg }) => {
  const [playVideo, setPlayVideo] = useState(null);
  const [viewFiles, setViewFiles] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const videoRefs = useRef({});
  let pendingFileLength = null;
  if (msg?.file && msg?.file?.length > 4) {
    pendingFileLength = msg?.file?.length - 4;
  }
  console.log(msg?.file);
  const handleVideoClick = (id) => {
    const currentVideo = videoRefs.current[id];

    if (playVideo && playVideo !== id) {
      const prevVideo = videoRefs.current[playVideo];
      prevVideo?.pause();
    }

    if (currentVideo.paused) {
      currentVideo.play();
      setPlayVideo(id);
    } else {
      currentVideo.pause();
      setPlayVideo(null);
    }
  };
  console.log(viewFiles);
  return (
    <div className="flex flex-wrap gap-2 mx-auto">
      {viewImage !== null && (
        <div
          className="inset-0 bg-black/85 fixed z-50 flex flex-col gap-5 items-center justify-center"
          onClick={() => setViewImage(null)}
        >
          <div className=" max-w-[400px] max-h-[300px]">
            {" "}
            <img
              src={viewImage}
              alt="viewfileimage"
              className="w-full h-full object-fill"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {viewFiles?.length > 1 && (
            <div
              className="flex gap-2  overflow-x-auto max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {viewFiles.map((file) =>
                file.fileType.startsWith("image/") ? (
                  <img
                    key={file.id}
                    src={file.filePath}
                    alt="thumbnail"
                    className={`h-20 w-20 object-cover cursor-pointer border-2 ${
                      viewImage === file.filePath
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    onClick={() => setViewImage(file.filePath)}
                  />
                ) : null
              )}
            </div>
          )}
        </div>
      )}
      {msg.file &&
        msg.file.length > 0 &&
        (msg?.file.length > 4 ? msg?.file?.slice(0, 4) : msg?.file).map(
          (file, index) => (
            <div
              className={`${
                msg?.text === null ? "hidden" : "block"
              } border border-gray-300/50 rounded-lg overflow-hidden max-w-[179px] max-h-[200px] relative`}
              key={file?.id}
            >
              <div
                className={`bg-[#5042C2]/50 flex items-center justify-center absolute ${
                  index === 3 ? "z-10 w-full h-full" : "opacity-0"
                }`}
              >
                <p className="text-white font-bold text-5xl">
                  {pendingFileLength} +
                </p>
              </div>
              {file.fileType.startsWith("image/") && (
                <img
                  src={file?.filePath}
                  alt="user"
                  className="h-full w-full cursor-pointer"
                  onClick={() => {
                    setViewFiles(msg?.file);
                    setViewImage(file?.filePath);
                  }}
                />
              )}
              {file.fileType.startsWith("video/") && (
                <div className="h-full w-full relative">
                  <video
                    ref={(el) => (videoRefs.current[file.id] = el)}
                    src={file?.filePath}
                    muted
                    loop
                    className="h-full w-full object-cover"
                    playsInline // important for mobile
                  />
                  <button
                    onClick={() => handleVideoClick(file?.id)}
                    className="absolute inset-0 flex items-center justify-center text-3xl text-white z-10"
                  >
                    {playVideo === file?.id ? (
                      <FaPauseCircle />
                    ) : (
                      <FaPlayCircle />
                    )}
                  </button>
                </div>
              )}

              {!file.fileType.startsWith("image/") &&
                !file.fileType.startsWith("video/") && (
                  <div className="bg-white rounded-lg p-2 text-[#564BD4] flex gap-1">
                    <span className="font-bold text-xl">
                      {" "}
                      <AiOutlineFile />{" "}
                    </span>
                    <span className="truncate">{file?.fileName}</span>
                  </div>
                )}
            </div>
          )
        )}
    </div>
  );
};

export default FilesView;
