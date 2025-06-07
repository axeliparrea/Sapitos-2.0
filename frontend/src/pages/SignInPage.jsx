import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const hasCheckedSession = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });

        if (!response.ok) {
          await clearInvalidSession();
          setCheckingSession(false);
          return;
        }

        const data = await response.json();
        let userRole;
        if (data.usuario && data.usuario.rol) {
          userRole = data.usuario.rol;
        } else if (data.token) {
          try {
            const decoded = jwtDecode(data.token);
            userRole = decoded.rol; 
          } catch {
            await clearInvalidSession();
            setCheckingSession(false);
            return;
          }
        } else {
          setCheckingSession(false);
          return;
        }

        if (
          (userRole === "admin" || userRole === "dueno" || userRole === "cliente" || userRole === "proveedor") &&
          window.location.pathname !== "/dashboard"
        ) {
          navigate("/dashboard");
        }
      } catch {
        await clearInvalidSession();
      } finally {
        setCheckingSession(false);
      }
    };

    // Función para limpiar sesión inválida
    const clearInvalidSession = async () => {
      try {
        await fetch("http://localhost:5000/users/logoutUser", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Error limpiando sesión:", error);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // // Primero limpiar cualquier sesión previa
      // await fetch("http://localhost:5000/users/logoutUser", {
      //   method: "POST",
      //   credentials: "include",
      // });

      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error en el inicio de sesión");
      }

      if (!data.usuario) {
        throw new Error("Datos de sesión incompletos");
      }

      console.log("Login exitoso:", data.usuario);
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
      
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error en el inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <span>Cargando...</span>
      </div>
    );
  }

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/' className='mb-40 max-w-290-px d-block'>
              <img src='assets/images/logo.png' alt='Logo' className='img-fluid' />
            </Link>
            <h4 className='mb-12'>Iniciar sesión</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Por favor ingrese sus datos
            </p>
          </div>
           
          <form onSubmit={handleLogin} className='needs-validation' noValidate>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mdi:email-outline' className='text-muted' />
              </span>
              <input
                type='email'
                id='username'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Correo electrónico'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
              />
            </div>

            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' className='text-muted' />
                </span>
                <input
                  type='password'
                  id='password'
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  placeholder='Contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete='current-password'
                />
              </div>
            </div>
             
            <div className='d-grid gap-3'>
              <button 
                id='loginButton' 
                type='submit'
                className='btn btn-primary h-48-px d-flex align-items-center justify-content-center radius-12'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>

              {error && (
                <div className="alert alert-danger d-flex align-items-center p-3 mb-0">
                  <Icon icon="mdi:alert-circle" className="me-2 flex-shrink-0 text-danger" />
                  <div className="text-sm">{error}</div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='Logo' className='img-fluid' />
        </div>
      </div>
    </section>
  );
};

export default SignInPage;