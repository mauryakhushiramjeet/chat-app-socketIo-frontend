import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

import { AiOutlineFile } from "react-icons/ai";
import { FaPlayCircle } from "react-icons/fa";
import { FaPauseCircle } from "react-icons/fa";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";

const FilesView = ({ msg }) => {
  const [playVideo, setPlayVideo] = useState(null);
  const [viewFiles, setViewFiles] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScrolledVideo = useRef({});
  const swiperRef = useRef(null);
  const videoRefs = useRef({});
  const isFirstImage = currentIndex === 0;
  const isLastImage = currentIndex === viewFiles.length - 1;

  console.log(msg?.file);
  // const handleVideoClick = (id) => {
  //   const currentVideo = videoRefs.current[id];

  //   if (playVideo && playVideo !== id) {
  //     const prevVideo = videoRefs.current[playVideo];
  //     prevVideo?.pause();
  //   }

  //   if (currentVideo.paused) {
  //     currentVideo.play();
  //     setPlayVideo(id);
  //   } else {
  //     currentVideo.pause();
  //     setPlayVideo(null);
  //   }
  // };
 
  console.log(viewFiles);
  console.log("isFisr", isFirstImage, "isLast", isLastImage);
  const handlePrevFile = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setViewImage(viewFiles[newIndex]);
      swiperRef?.current?.slideTo(newIndex);
    }
  };
  const handleNextFile = (e) => {
    e.stopPropagation();
    console.log(viewFiles);
    if (currentIndex < viewFiles.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setViewImage(viewFiles[newIndex]);
      swiperRef?.current?.slideTo(newIndex);
    }
  };
  console.log(viewImage, "viewimage", currentIndex);
  const chatFiles = msg?.file || [];

  const mediaFiles = chatFiles.filter(
    (f) => f.fileType.startsWith("image/") || f.fileType.startsWith("video/")
  );
  console.log(mediaFiles.length, "media file");
  console.log(viewFiles, "view files");
  console.log(currentIndex);
  return (
    <div className="flex flex-wrap gap-2 mx-auto">
      {viewImage !== null && (
        <div
          className="inset-0 bg-black/85 fixed z-50 p-[50px] flex flex-col gap-5 items-center justify-center"
          onClick={() => setViewImage(null)}
        >
          <div className="flex h-full w-full items-center justify-center relative">
            <button
              // swiper-prev
              disabled={isFirstImage}
              className={`swiper-prev absolute left-9 text-3xl border p-3 rounded-full text-gray-100 hover:text-[#564BD4] ${
                isFirstImage ? "cursor-default" : "cursor-pointer"
              }`}
              title="Previous"
              onClick={(e) => handlePrevFile(e)}
            >
              <GrPrevious />
            </button>
            <div className="h-full w-full max-w-[500px] max-h-[400px]">
              {" "}
              {viewImage?.fileType.startsWith("image/") && (
                <img
                  src={viewImage.filePath}
                  alt="viewfileimage"
                  className="w-full h-full shadow-2xl  object-fill border border-gray-300/10 overflow-hidden rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {viewImage?.fileType.startsWith("video/") && (
                <div className="h-full w-full relative">
                  <video
                    ref={(el) =>
                      (currentScrolledVideo.current[viewImage?.id] = el)
                    }
                    controls
                    src={viewImage?.filePath}
                    alt="viewfileimage"
                    className="w-full h-full shadow-2xl  object-fill border border-gray-300/10 overflow-hidden rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
            <button
              // swiper-next
              disabled={isLastImage}
              className={` absolute right-9 text-3xl border p-3 rounded-full text-gray-100 hover:text-[#564BD4] ${
                isLastImage ? "cursor-default" : "cursor-pointer"
              }`}
              title="Next"
              onClick={(e) => handleNextFile(e)}
            >
              <GrNext />
            </button>
          </div>
          {/* slide senction */}
          {viewFiles?.length > 1 && (
            <Swiper
              className="w-full max-w-[500px] border h-full max-h-24"
              modules={[Navigation]}
              slidesPerView={viewFiles?.length > 4 ? 4 : "auto"}
              spaceBetween={10}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              // navigation={{
              //   prevEl: ".swiper-prev",
              //   nextEl: ".swiper-next",
              // }}
              onSlideChange={(swiper) => {
                const index = swiper.activeIndex;
                setCurrentIndex(index);
                setViewImage(viewFiles[index]);
              }}
            >
              {viewFiles.map((file, index) => (
                <SwiperSlide key={file.id} className="borde w-full max-w-28">
                  {" "}
                  {file.fileType.startsWith("image/") && (
                    <img
                      src={file.filePath}
                      alt="thumbnail"
                      className={`h-full w-full object-cover cursor-pointer border-2 rounded-lg overflow-hidden ${
                        viewImage?.id === file.id
                          ? "border-2 border-white"
                          : "border-transparent"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewImage(file);
                        setCurrentIndex(index);
                      }}
                    />
                  )}
                  {file.fileType.startsWith("video/") && (
                    <div className="w-full h-full relative">
                      <video
                        key={file.id}
                        src={file.filePath}
                        alt="thumbnail"
                        className={`h-full w-full object-cover cursor-pointer border-2 rounded-lg overflow-hidden ${
                          viewImage?.id === file.id
                            ? "border-white"
                            : "border-transparent"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewImage(file);
                          setCurrentIndex(index);
                        }}
                      />
                      <button
                        className="absolute inset-0 bg-black/30 flex items-center justify-center text-3xl text-white z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewImage(file);
                        }}
                      >
                        {playVideo === file?.id ? (
                          <FaPauseCircle />
                        ) : (
                          <FaPlayCircle />
                        )}
                      </button>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      )}
      {/* chat secyion */}
      {chatFiles.length > 0 &&
        (chatFiles || []).map((file, index) => (
          <div
            className={`${msg?.text === null ? "hidden" : "block"} ${
              index > 3 &&
              (file?.fileType?.startsWith("image/") ||
                file?.fileType?.startsWith("video/"))
                ? "hidden"
                : "block"
            } 
             relative`}
            key={file?.id}
          >
            <div
              className={`bg-[#5042C2]/50 flex items-center justify-center absolute  ${
                index === 3 &&
                mediaFiles?.length > 4 &&
                (file.fileType.startsWith("image/") ||
                  file.fileType.startsWith("video/"))
                  ? "z-10 w-full h-full"
                  : "opacity-0"
              }`}
            >
              <p className="text-white font-bold text-5xl">
                {Number(mediaFiles?.length) - 4 > 4 ? (
                  <p>
                    {Number(mediaFiles?.length) - 4}
                    <span>+</span>
                  </p>
                ) : null}{" "}
              </p>
            </div>
            {file.fileType.startsWith("image/") && (
              <img
                src={file?.filePath}
                alt="user"
                className={`h-full w-full cursor-pointer border border-gray-300/50 rounded-lg  bg-[#786FDD] overflow-hidden max-w-[179px] max-h-[200px] object-fill`}
                onClick={() => {
                  setViewFiles(mediaFiles);
                  setCurrentIndex(
                    mediaFiles.findIndex((f) => f.id === file.id)
                  );
                  setViewImage(file);
                }}
              />
            )}
            {file.fileType.startsWith("video/") && (
              <div className="h-full w-full relative border border-gray-300/50 rounded-lg overflow-hidden max-w-[179px] max-h-[200px]">
                <video
                  ref={(el) => (videoRefs.current[file?.id] = el)}
                  src={file?.filePath}
                  muted
                  controls
                  // loop
                  className={`h-full w-full cursor-pointer object-fill`}
                  playsInline
                  onClick={() => {
                    setViewFiles(chatFiles);
                    setViewImage(mediaFiles);
                    setCurrentIndex(
                      mediaFiles.findIndex((f) => f.id === file.id)
                    );
                  }}
                />
             
              </div>
            )}

            {!file.fileType.startsWith("image/") &&
              !file.fileType.startsWith("video/") && (
                <div className="bg-white rounded-lg p-2 border-2 text-[#564BD4] flex gap-1 cursor-pointer border-gray-200 ">
                  <span className="font-bold text-xl">
                    {" "}
                    <AiOutlineFile />{" "}
                  </span>
                  <span className="truncate">{file?.fileName}</span>
                </div>
              )}
          </div>
        ))}
    </div>
  );
};

export default FilesView;
