import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import * as jwt_decode from "jwt-decode";
const jwtDecode = jwt_decode.default;



const SignInPage = () => {
  const [correoOUsuario, setCorreoOUsuario] = useState("");
  const [clave, setClave] = useState("");
  const navigate = useNavigate();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/usuario2/getSession", {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();
        const decoded = jwtDecode(data.token);
        const rol = decoded.rol;

        if ([1, 2, 3].includes(rol)) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("No se pudo verificar la sesión:", error);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/usuario2/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correoOUsuario,
          Clave: clave,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }

      const data = await response.json();
      const decoded = jwtDecode(data.token);
      const rol = decoded.rol;

      if ([1, 2, 3].includes(rol)) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("❌ Login fallido:", error);
    }
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='WowDash Auth' />
        </div>
      </div>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/index' className='mb-40 max-w-290-px'>
              <img src='assets/images/logo.png' alt='WowDash Logo' />
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
                type='text'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Correo o Usuario'
                value={correoOUsuario}
                onChange={(e) => setCorreoOUsuario(e.target.value)}
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
                  placeholder='Contraseña'
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;
