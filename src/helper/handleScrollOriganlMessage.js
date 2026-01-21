export const handleScrollOriganlMessage = (messageId, messageReplyRef) => {
  console.log(messageId, messageReplyRef.current[messageId]);
  const scrollMessageEl = messageReplyRef.current[messageId];
  if (scrollMessageEl) {
    scrollMessageEl.scrollIntoView({ behaviour: "auto" });
    scrollMessageEl.style.borderRadius = "10px";
    scrollMessageEl.style.backgroundColor = "#bdb9f7";
    scrollMessageEl.style.transition = "background-color 1s ease ";
    setTimeout(() => {
      scrollMessageEl.style.backgroundColor = "transparent";
      // background-color: transparent
    }, 1000);
  }
};
