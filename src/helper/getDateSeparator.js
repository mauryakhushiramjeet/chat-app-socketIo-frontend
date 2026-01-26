export const getDateSeperator = (date) => {
  const msgDate = new Date(date);
  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
  if (isSameDay(msgDate, today)) return "Toady";
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(msgDate, yesterday)) return "Yesterday";

  return msgDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
