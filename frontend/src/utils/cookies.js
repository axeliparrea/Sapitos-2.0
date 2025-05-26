const getCookie = (name) => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];

  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch (e) {
    console.error("Failed to parse cookie:", e);
    return null;
  }
};

export default getCookie;
