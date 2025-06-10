import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ErrorDialog from "../components/ErrorDialog";
import './SignInPage.css';

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const hasCheckedSession = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

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

        if (data.requiresOtp) {
          await generateOTP();
          setCheckingSession(false);
          return;
        }

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
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        let message = "Error en el inicio de sesión";
        if (data.error === "Usuario no encontrado") {
          message = "El usuario no existe en el sistema";
        } else if (data.error === "Contraseña incorrecta") {
          message = "La contraseña ingresada es incorrecta";
        }
        setErrorMessage(message);
        setDialogOpen(true);
        throw new Error(data.error || message);
      }

      if (!data.usuario) {
        setErrorMessage("Datos de sesión incompletos");
        setDialogOpen(true);
        throw new Error("Datos de sesión incompletos");
      }

      if (data.requiresOtp) {
        const otpData = await generateOTP();
        if (otpData && otpData.secret) {
          sessionStorage.setItem('otpSecret', otpData.secret);
        }
        navigate('/otp');
      } else {
        setIsLoginMode(false);
      }

    } catch (error) {
      setError(error.message || "Error en el inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const generateOTP = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/otp/generate", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al generar OTP");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message || "Error generando OTP");
      return null;
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  if (checkingSession) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <span>Cargando...</span>
      </div>
    );
  }

  return (
    <section className='auth d-flex align-items-center justify-content-center min-vh-100' style={{
      background: '#f5f5f5',
      position: 'relative'
    }}>
      <div className='container-slider' style={{
        width: '100vw',
        height: '100vh',
        background: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div className={`slider-content ${isLoginMode ? '' : 'right-panel-active'}`}>
          {/* Panel de Formularios */}
          <div className='forms-container'>
            <div className='signin-signup'>

              {/* FORMULARIO DE LOGIN */}
              <form onSubmit={handleLogin} className='sign-in-form needs-validation' noValidate>
                <div className="text-center mb-4">
                  <h4 className='mb-12'>Iniciar sesión</h4>
                  <p className='mb-32 text-secondary-light text-lg'>
                    Por favor ingrese sus datos
                  </p>
                </div>

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

                {/* BOTÓN LOGIN CON MARGEN SUPERIOR */}
                <div className='d-grid gap-3 mt-4'>
                  <button
                    id='loginButton'
                    type='submit'
                    className='btn btn-primary'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : 'Iniciar sesión'}
                  </button>
                </div>
              </form>

              {/* FORMULARIO DE REGISTRO */}
              <form className='sign-up-form'>
                <div className="text-center mb-3 mt-4">
                  <h4 className='mb-2'>Verificación de seguridad</h4>
                  <p className='mb-4 text-secondary-light px-4'>
                    Hemos enviado un código de verificación a tu correo electrónico.
                    Por favor, ingresa el código para continuar.
                  </p>
                </div>

                <div className='mb-4 mt-2'>
                  <label className='form-label mb-3'>Código de verificación</label>
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {[0,1,2,3,4,5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        className="form-control text-center h-56-px bg-neutral-50 radius-12"
                        style={{ 
                          width: '50px', 
                          fontSize: '2rem', 
                          fontWeight: 'bold',
                          padding: '0.25rem 0'
                        }}
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>
                
                <div className='d-grid gap-3 mt-3'>
                  <button 
                    type='submit'
                    className='btn btn-primary h-48-px d-flex align-items-center justify-content-center radius-12'
                  >
                    <Icon icon="solar:shield-check-bold" className="me-2" />
                    <span>Verificar código</span>
                  </button>
                  
                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      className="btn btn-link text-decoration-none"
                    >
                      Reenviar código
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* PANEL IZQUIERDO CON IMAGEN GRANDE Y CENTRADA */}
          <div className='panels-container'>
            <div className='panel left-panel d-flex align-items-center justify-content-center'>
              <img
                src='assets/images/auth/auth-img.png'
                className='image left-image'
                alt='Imagen'
                style={{
                  width: '120%',
                  height: 'auto',
                  transform: 'scale(1.2)',
                  objectFit: 'contain',
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />
            </div>
            <div className='panel right-panel'>

              <img src='assets/images/auth/auth-img.png' className='image' alt='' />
            </div>
          </div>
        </div>
      </div>

      <ErrorDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        errorMessage={errorMessage}
      />
    </section>
  );
};

export default SignInPage;