const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    
    if (cookieName === name) {
      // Verificar que el valor existe y no es 'undefined'
      if (!cookieValue || cookieValue === 'undefined') {
        return null;
      }
      
      try {
        const decodedValue = decodeURIComponent(cookieValue);
        
        // Verificar que el valor decodificado no sea 'undefined'
        if (decodedValue === 'undefined') {
          return null;
        }
        
        return JSON.parse(decodedValue);
      } catch (e) {
        console.error(`Failed to parse '${name}' cookie:`, e);
        return null;
      }
    }
  }
  
  return null;
};

export default getCookie;