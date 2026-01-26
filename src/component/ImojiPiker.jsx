import React, { useEffect, useState } from "react";
import Picker from "emoji-picker-react";

const ImojiPiker = ({ showImozi, setShowImozi, setMessage }) => {
  const getSize = () => {
    const w = window.innerWidth;

    if (w < 425) {
      return { width: 250, height:300 }; // mobile
    }
    if (w < 640) {
      return { width: 300, height:300 }; // mobile
    }

    if (w < 1024) {
      return { width: 320, height: 360 }; // tablet
    }
     if (w < 1536) {
      return { width: 400, height: 400 }; // tablet
    }

    return { width: 450, height: 420 }; // desktop
  };
  const [size, setSize] = useState(getSize());

  useEffect(() => {
    const onResize = () => setSize(getSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return (
    <Picker
      open={showImozi}
      // className="emoji-wrapper"
      emojiStyle="small"
      // emoji
      onEmojiClick={(emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
        setShowImozi(false);
      }}
      width={size?.width}
      height={size?.height}
    />
  );
};

export default ImojiPiker;
