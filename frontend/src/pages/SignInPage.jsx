import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const hasCheckedSession = useRef(false)

  useEffect(() => {
    if (hasCheckedSession.current) return; 
    hasCheckedSession.current = true;    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();
        console.log("Session data:", data);
        
        // Determinar el rol del usuario
        let userRole;
        if (data.usuario && data.usuario.rol) {
          userRole = data.usuario.rol;
        } else if (data.token) {
          const decoded = jwtDecode(data.token);
          console.log("Usuario ya autenticado:", decoded);
          userRole = decoded.rol || decoded.ROL;
        } else {
          return; // No hay información válida de sesión
        }

        if (userRole === "admin" || userRole === "dueno" || userRole === "cliente" || userRole === "proveedor" ) {
          navigate("/dashboard");
        } else {
          console.log("Rol no reconocido:", userRole); 
        }
      } catch (error) {
        console.error("No se pudo verificar la sesión:", error);
      }
    };

    checkSession();
  }, [navigate]); 
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
        credentials: "include",
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Verificar que el token y el usuario existen
      if (!data.token || !data.usuario) {
        throw new Error("Datos de sesión incompletos");
      }

      console.log("Login exitoso:", data.usuario);
      
      // Pequeño retraso para asegurar que las cookies se guarden
      setTimeout(() => {
        window.location.href = "/dashboard";  // Usar redirección directa en lugar de navigate
      }, 100);
      
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Login failed");
    }
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='WowDash React Vite' />
        </div>
      </div>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/index' className='mb-40 max-w-290-px'>
              <img src='assets/images/logo.png' alt='WowDash React Vite' />
            </Link>
            <h4 className='mb-12'>Iniciar sesión</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Por favor ingrese sus datos
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Correo electrónico'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' />
                </span>
                <input
                  type='password'
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  id='your-password'
                  placeholder='Contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'>
              Iniciar sesión
            </button>
    
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;
