import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ErrorDialog from "../components/ErrorDialog";

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
        
        // Verificar si requiere OTP
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
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
        credentials: "include",
      });
      
      console.log("Respuesta de login recibida:", {
        status: response.status,
        ok: response.ok
      });
      
      const data = await response.json();
      console.log("Datos de login:", {
        requiresOtp: !!data.requiresOtp,
        hasUser: !!data.usuario,
        hasToken: !!data.token,
        mensaje: data.message || data.mensaje
      });
      
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

      console.log("Login exitoso:", data.usuario);
        // OTP
      if (data.requiresOtp) {
        console.log("OTP verification required");
        
        // Generate OTP and store secret in session storage instead of state
        const otpData = await generateOTP();
        if (otpData && otpData.secret) {
          sessionStorage.setItem('otpSecret', otpData.secret);
        }
        
        // Redirect to OTP page instead of showing a modal
        navigate('/otp');
      } else {
        // Redirect if OTP is not required
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
      
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error en el inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };
  const generateOTP = async () => {
    console.log("Iniciando generación de OTP...");
    try {
      const response = await fetch("http://localhost:5000/api/otp/generate", {
        method: "GET",  
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error(`Error HTTP: ${response.status} - ${response.statusText}`);
        const errorData = await response.json().catch(() => null);
        console.error("Detalles del error:", errorData);
        throw new Error(errorData?.message || "Error al generar OTP");
      }
      
      const data = await response.json();
      console.log("Respuesta de generación OTP:", { 
        success: data.success,
        message: data.message,
        hasSecret: !!data.secret,
        devMode: process.env.NODE_ENV === 'development',
        authOtp: data.authOtpEnabled // El backend debe enviar este valor
      });
        // We'll store the secret in sessionStorage in the login function instead
      
      // En desarrollo, podemos mostrar el OTP en consola
      if (process.env.NODE_ENV === 'development' && data.otp) {
        console.log("Código OTP (solo desarrollo):", data.otp);
      }
      
      return data;
    } catch (error) {
      console.error("Error generando OTP:", error);
      setError(error.message || "Error generando OTP");
      return null;
    }
  };
  // OTP verification now handled in OtpPage.jsx

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
            </div>
          </form>
        </div>
      </div>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='Logo' className='img-fluid' />
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