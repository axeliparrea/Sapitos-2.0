const getCookie = (name, decode = true) => {
  const regex = new RegExp(`(^| )${name}=([^;]+)`)
  const match = document.cookie.match(regex)
  if (match) {
    console.log(match[2])
    return match[2]
  }
  return null

};

export default getCookie;
