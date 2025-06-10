import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ErrorDialog from "../components/ErrorDialog";
import './SignInPage.css';

const SignInPage = () => {
  const [correoOUsuario, setCorreoOUsuario] = useState("");
  const [clave, setClave] = useState("");
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
        const response = await fetch("http://localhost:5000/usuario2/getSession", {
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
      const response = await fetch("http://localhost:5000/usuario2/login", {
        method: "POST",
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
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
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
      padding: '2rem',
      position: 'relative'
    }}>
      {/* LOGO ARRIBA IZQUIERDA */}
      <img
        src='assets/images/logo.png'
        alt='Logo'
        style={{
          position: 'absolute',
          top: '24px',
          left: '32px',
          width: '220px',
          zIndex: 10
        }}
      />

      <div className='container-slider' style={{
        width: '100%',
        maxWidth: '900px',
        minHeight: '550px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 15px 25px rgba(0,0,0,0.1)',
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
                <h2 className='title'>Sign Up</h2>
                <div className='input-field'>
                  <Icon icon='mdi:user-outline' className='input-icon' />
                  <input type='text' placeholder='Username' />
                </div>
                <div className='input-field'>
                  <Icon icon='mdi:email-outline' className='input-icon' />
                  <input type='email' placeholder='Email' />
                </div>
                <div className='input-field'>
                  <Icon icon='solar:lock-password-outline' className='input-icon' />
                  <input type='password' placeholder='Password' />
                </div>
                <button type='button' className='btn solid'>Sign Up</button>
              </form>
            </div>
          </div>

          {/* PANEL IZQUIERDO CON IMAGEN GRANDE Y CENTRADA */}
          <div className='panels-container'>
            <div className='panel left-panel d-flex align-items-center justify-content-center'>
              <img
                src='assets/images/auth/auth-img.png'
                className='image'
                alt='Imagen'
                style={{
                  width: '120%',
                  height: 'auto',
                  transform: 'scale(1.2)',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div className='panel right-panel'>
              <div className='content'>
                <h3>One of us?</h3>
                <p>Sign in and continue your journey with us!</p>
                <button className='btn transparent' onClick={toggleMode}>Sign In</button>
              </div>
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
