const getCookie = (name, decode = true) => {
  const cookieValue = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];

  //console.log(cookieValue, "Cookie Encoded")
  
  let cookieData;
  try {
    cookieData = decodeURIComponent(decodeURIComponent(cookieValue));
    //console.log(cookieData, "Cookie Decoded");
    return JSON.parse(cookieData);
  } catch (e) {
    console.error("Failed to parse UserData cookie:", e, cookieValue);
    return null;
}

};

export default getCookie;
