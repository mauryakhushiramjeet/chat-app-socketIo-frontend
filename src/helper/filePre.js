export const isPreviewable = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'txt'];
  return allowed.includes(ext);
};
export const getdefaultProfile = (name) => {
    if (!name) return;
    const spiltName = name.split(" ");
    return spiltName.length > 1
      ? `${spiltName[0][0]}${spiltName[1][0]}`
      : `${spiltName[0][0]}`;
  };