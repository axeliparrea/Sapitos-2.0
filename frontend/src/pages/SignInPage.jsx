import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasCheckedSession = useRef(false)
  const API_BASE_URL = "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;
    
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/getSession`, {
          credentials: "include",
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        let userRole;
        
        if (data.usuario && data.usuario.rol) {
          userRole = data.usuario.rol;
        } else if (data.token) {
          const decoded = jwtDecode(data.token);
          userRole = decoded.rol || decoded.ROL;
        }

        if (userRole && ["admin", "dueno", "cliente", "proveedor"].includes(userRole)) {
          localStorage.setItem('userRole', userRole);
          window.location.href = "/dashboard";
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, API_BASE_URL]); 

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
        credentials: "include",
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.token || !data.usuario) {
        throw new Error("Datos de sesión incompletos");
      }

      // Almacenar el token en localStorage para persistencia
      localStorage.setItem('userRole', data.usuario.rol);
      
      // Usar window.location.href en lugar de navigate para forzar un refresh completo
      navigate("/dashboard");
      
    } catch (error) {
      setLoading(false);
      alert(error.message || "Login failed");
    }
  };

  if (loading) {
    return (
      <section className='auth bg-base d-flex flex-wrap'>
        <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center w-100'>
          <div className='max-w-464-px mx-auto w-100 text-center'>
            <Icon icon="mdi:loading" className="text-primary text-3xl animate-spin mb-3" />
            <p>Verificando sesión...</p>
          </div>
        </div>
      </section>
    );
  }



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
                id='username'
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
                  id='password'
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  placeholder='Contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button id='loginButton' type='submit'
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
