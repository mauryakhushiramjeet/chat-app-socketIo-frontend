import React from 'react';

const ChatMessageShimmer = () => {
  // Creating an array to represent a mix of messages
  const shimmerRows = [
    { isMe: false, width: 'w-2/3 lg:w-1/2' },
    { isMe: true, width: 'w-1/2 lg:w-1/3' },
    { isMe: false, width: 'w-3/4 lg:w-2/3' },
    // { isMe: true, width: 'w-1/4 lg:w-1/5' },
    // { isMe: false, width: 'w-1/2 lg:w-1/3' },
  ];

  return (
    <div className="flex-1 px-3 xl:px-6 py-4 bg-[#F9FAFB] space-y-7 overflow-hidden animate-pulse">
      {shimmerRows.map((item, i) => (
        <div
          key={i}
          className={`flex w-full ${item.isMe ? "justify-end" : "justify-start"}`}
        >
          <div className={`flex gap-1 w-full ${item.isMe ? "justify-end" : "justify-start"}`}>
            
            {/* Avatar Shimmer (Only for "Other" messages) */}
            {!item.isMe && (
              <div className="shrink-0">
                <div className="w-6 xl:w-10 3xl:w-12 h-6 xl:h-10 3xl:h-12 rounded-full bg-gray-200 border border-gray-100" />
              </div>
            )}

            {/* Message Bubble Shimmer */}
            <div
              className={`px-3 py-3 shadow-sm flex flex-col gap-2 ${item.width} ${
                item.isMe
                  ? "bg-indigo-200 rounded-2xl rounded-tr-none" // Lighter version of your #574CD6
                  : "bg-gray-200 rounded-2xl rounded-tl-none border border-gray-100"
              }`}
            >
              {/* Main Text Lines */}
              <div className="space-y-2">
                <div className={`h-3 rounded ${item.isMe ? "bg-white/40" : "bg-gray-300"} w-full`}></div>
                <div className={`h-3 rounded ${item.isMe ? "bg-white/40" : "bg-gray-300"} w-5/6`}></div>
              </div>

              {/* Footer (Time) Shimmer */}
              <div className={`flex ${item.isMe ? "justify-end" : "justify-start"}`}>
                 <div className={`h-2 w-10 rounded ${item.isMe ? "bg-white/30" : "bg-gray-300"}`}></div>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessageShimmer;