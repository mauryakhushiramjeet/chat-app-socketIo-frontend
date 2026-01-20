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
import FilePreviewPage from "./FilePreviewPage";

const FilesView = ({ msg }) => {
  const [playVideo, setPlayVideo] = useState(null);
  const [viewFiles, setViewFiles] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);
  const videoRefs = useRef({});
  const isFirstImage = currentIndex === 0;
  const isLastImage = currentIndex === viewFiles.length - 1;

  // console.log(msg?.file);
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

  // console.log(viewFiles);
  // console.log("isFisr", isFirstImage, "isLast", isLastImage);
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
    // console.log(viewFiles);
    if (currentIndex < viewFiles.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setViewImage(viewFiles[newIndex]);
      swiperRef?.current?.slideTo(newIndex);
    }
  };
  // console.log(viewImage, "viewimage", currentIndex);
  const chatFiles = msg?.file || [];
  // console.log(chatFiles, "chat fies");
  const mediaFiles = chatFiles?.filter(
    (f) => f.fileType?.startsWith("image/") || f.fileType?.startsWith("video/"),
  );
  // console.log(mediaFiles.length, "media file");
  // console.log(viewFiles, "view files");
  // console.log(currentIndex);
  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.filePath;
    link.download = file.fileName; // ⭐ real filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileClick = (file) => {
    setPreviewFile(file);
  };

  useEffect(() => {
    const checkScreen = () => {
      setShowControls(window.innerWidth >= 640);
    };

    checkScreen(); // run on load
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  // console.log(viewImage, "view");
  // console.log(viewFiles);
  return (
    <div className="flex flex-wrap gap-2 ">
      {viewImage !== null && (
        <div
          className="inset-0 bg-black/90 fixed z-[88] p-3 xs:p-[50px] flex flex-col gap-5 items-center justify-center"
          onClick={() => setViewImage(null)}
        >
          <div
            className={`${
              viewFiles?.length > 1 && window.innerWidth <= 425
                ? "hidden"
                : "block"
            } flex h-fit  w-full items-center justify-center relative `}
          >
            <button
              // swiper-prev
              disabled={isFirstImage}
              className={`${
                viewFiles?.length > 1 ? "block" : "hidden"
              } swiper-prev absolute left-[-20px] sm:left-9 text-xl md:text-3xl p-2 md:p-3 rounded-full text-gray-100 hover:text-[#564BD4] ${
                isFirstImage ? "cursor-default" : "cursor-pointer"
              }`}
              title="Previous"
              onClick={(e) => handlePrevFile(e)}
            >
              <GrPrevious />
            </button>
            <div className="w-full xs:w-[250px] md:w-[300px] lg:w-[400px] 3xl:w-[600px] h-[250px] lg:h-[300px] 3xl:h-[500px]">
              {" "}
              {viewImage?.fileType?.startsWith("image/") && (
                <img
                  src={viewImage.filePath}
                  alt="viewfileimage"
                  className="w-full h-full shadow-2xl object-fill border border-gray-300/10 overflow-hidden rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {viewImage?.fileType?.startsWith("video/") && (
                <div className="h-full w-full relative">
                  <video
                    // ref={(el) =>
                    //   (currentScrolledVideo.current[viewImage?.id] = el)
                    // }
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
              className={`${
                viewFiles?.length > 1 ? "block" : "hidden"
              }  absolute right-[-20px] sm:right-9 text-xl md:text-3xl p-2 md:p-3 rounded-full text-gray-100 hover:text-[#564BD4] ${
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
              className="w-full xs:max-w-[250px] md:max-w-[300px] lg:max-w-[500px] 3xl:max-w-[600px] mt-6 lg:mt-0"
              modules={[Navigation]}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                425: {
                  slidesPerView: viewFiles?.length > 4 ? 4 : "auto",
                },
              }}
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
                <SwiperSlide
                  key={file.id}
                  className="borde w-full xs:max-w-28 2xl:max-w-[200px]"
                >
                  {" "}
                  {file?.fileType?.startsWith("image/") && (
                    <img
                      src={file.filePath}
                      alt="thumbnail"
                      className={`h-[250px] xs:h-20 md:h-[100px] lg:h-full w-full object-cover cursor-pointer border-2 rounded-lg overflow-hidden ${
                        viewImage?.id === file.id
                          ? "xs:border-2 border-white"
                          : "border-transparent"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewImage(file);
                        setCurrentIndex(index);
                      }}
                    />
                  )}
                  {file?.fileType?.startsWith("video/") && (
                    <div className="w-full h-[250px] xs:h-[100px] lg:h-full relative">
                      <video
                        key={file.id}
                        src={file.filePath}
                        alt="thumbnail"
                        className={`h-full w-full object-cover cursor-pointer border-2 rounded-lg overflow-hidden ${
                          viewImage?.id === file.id
                            ? "xs:border-white"
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
      {previewFile && (
        <FilePreviewPage
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* chat secyion */}
      {chatFiles.length !== 0 &&
        (chatFiles || []).map((file, index) => (
          <div
            className={`${msg?.text === null ? "hidden" : "block"} ${
              index > 3 &&
              (file?.fileType?.startsWith("image/") ||
                file?.fileType?.startsWith("video/"))
                ? "hidden"
                : "flex"
            } 
            ${
              chatFiles?.length >= 2
                ? "w-[calc(50%-4px)]"
                : "max-w-[230px] xs:max-w-[250px] 2xl:max-w-[300]"
            }
             relative`}
            key={file?.id}
          >
            <div
              className={`bg-[#5042C2]/50 flex items-center justify-center absolute  ${
                index === 3 &&
                mediaFiles?.length > 4 &&
                (file?.fileType?.startsWith("image/") ||
                  file?.fileType?.startsWith("video/"))
                  ? "z-10 w-full h-full"
                  : "opacity-0"
              }`}
            >
              <p className="text-white font-bold text-2xl xl:text-3xl 2xl:text-5xl">
                {Number(mediaFiles?.length) + 1 - 4 > 0 ? (
                  <p>
                    {Number(mediaFiles?.length) - 4}
                    <span>+</span>
                  </p>
                ) : null}{" "}
              </p>
            </div>
            {file?.fileType?.startsWith("image/") && (
              <div className="h-full w-full cursor-pointer border border-gray-300/50 rounded-lg  bg-[#786FDD] overflow-hidden  max-h-[200px] ">
                <img
                  src={file?.filePath}
                  alt="user"
                  className={`h-full w-full cursor-pointer object-cover`}
                  onClick={() => {
                    setViewFiles(mediaFiles);
                    setCurrentIndex(
                      mediaFiles.findIndex((f) => f.id === file.id),
                    );
                    setViewImage(file);
                  }}
                />
              </div>
            )}
            {file?.fileType?.startsWith("video/") && (
              <div className="max-h-[180px] md:max-h-[200px] w-full relative border border-gray-300/50 rounded-lg overflow- relative ">
                <video
                  ref={(el) => (videoRefs.current[file?.id] = el)}
                  src={file?.filePath}
                  muted
                  controls={showControls}
                  // loop
                  className={`h-full w-full cursor-pointer object-cover`}
                  playsInline
                  onClick={() => {
                    setViewFiles(chatFiles);
                    setViewImage(mediaFiles);
                    setCurrentIndex(
                      mediaFiles.findIndex((f) => f.id === file.id),
                    );
                  }}
                />
                <button
                  onClick={() => {
                    setViewFiles(chatFiles);
                    setViewImage(mediaFiles);
                    setCurrentIndex(
                      mediaFiles.findIndex((f) => f.id === file.id),
                    );
                  }}
                  className="block xs:hidden absolute left-1/2 top-1/2 text-white text-xl cursor-pointer"
                >
                  <FaPlayCircle />
                </button>
              </div>
            )}

            {!file?.fileType?.startsWith("image/") &&
              !file?.fileType?.startsWith("video/") && (
                <div
                  onClick={() => handleFileClick(file)}
                  // onClick={()=>window.open(file?.filePath, "_blank")}
                  className="text-xs xl:text-sm 2xl:text-lg 3xl:text-xl font-semibold bg-white h-fit rounded-lg p-2 border-2 text-[#564BD4] flex items-center gap-2 cursor-pointer border-gray-200 w-full max-w-[120px] xs:max-w-[184px] sm:max-w-full"
                >
                  <span className="font-bold">
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
