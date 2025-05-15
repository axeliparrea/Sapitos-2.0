import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("https://sapitos-20-production.up.railway.app/users/getSession", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("https://sapitos-20-production.up.railway.app/users/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: email, contrasena: password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      // Redirigir después de login exitoso
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Login failed");
    }
  };

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
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




