  export const getdefaultProfile = (name) => {
    if (!name) return "";
    const spiltName = name.split(" ");
    return spiltName.length > 1
      ? `${spiltName[0][0]}${spiltName[1][0]}`.toUpperCase()
      : `${spiltName[0][0]}`.toUpperCase();
  };