import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditUserLayer = () => {
  // Obtendremos el ID del usuario desde los parámetros de la URL
  const { userId } = useParams();
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
    organizacion: "",
    contrasena: "",
    rol: "",
    diasordenprom: 0,
    valorordenprom: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Efecto para cargar los datos del usuario cuando el componente se monta
  useEffect(() => {
    const fetchUsuario = async () => {
      if (!userId) return;
      
      try {
        setLoadingData(true);
        // Obtener todos los usuarios y filtrar por el correo/userId
        const response = await axios.get(`http://localhost:5000/users/getUsers`);
        
        // Buscar el usuario específico en la lista
        const usuarioEncontrado = response.data.find(user => user.correo === userId);
        
        if (!usuarioEncontrado) {
          throw new Error("Usuario no encontrado");
        }
        
        setUsuario({
            nombre: usuarioEncontrado.nombre || "",
            correo: usuarioEncontrado.correo || "",
            organizacion: usuarioEncontrado.organizacion || "",
            contrasena: "",
            rol: usuarioEncontrado.rol || "",
            diasordenprom: usuarioEncontrado.diasOrdenProm || 0,
            valorordenprom: usuarioEncontrado.valorOrdenProm || 0,
        });
        
        // Si el usuario tiene una imagen de perfil, la cargamos
        if (usuarioEncontrado.imagen) {
          setImagePreviewUrl(usuarioEncontrado.imagen);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        setError('Error al cargar los datos del usuario: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoadingData(false);
      }
    };

    fetchUsuario();
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const actualizarUsuario = async () => {
    setLoading(true);
    setError(null);
    try {
      // Preparamos los datos para la actualización
      const datosActualizacion = {
        correo: usuario.correo,
        nombre: usuario.nombre,
        organizacion: usuario.organizacion,
        rol: usuario.rol
      };

      // Si se proporciona una nueva contraseña, la incluimos
      if (usuario.contrasena) {
        datosActualizacion.contrasena = usuario.contrasena;
      }

      // Incluimos la imagen si se actualizó
      if (imagePreviewUrl && imagePreviewUrl !== usuario.imagen) {
        datosActualizacion.imagen = imagePreviewUrl;
      }

      // Usar el endpoint updateUser que ya existe
      await axios.put(`http://localhost:5000/users/updateUser`, datosActualizacion);
      
      navigate("/usuarios"); // Redirige automáticamente al guardar
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setError('Error al actualizar usuario: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-body">
                <h6 className="text-md text-primary-light mb-16">
                  Imagen de perfil
                </h6>

                {loadingData ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando datos del usuario...</p>
                  </div>
                ) : (
                  <>
                    {/* Cargar Imagen */}
                    <div className="mb-24 mt-16">
                      <div className="avatar-upload">
                        <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                          <input
                            type="file"
                            id="imageUpload"
                            accept=".png, .jpg, .jpeg"
                            hidden
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="imageUpload"
                            className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                          >
                            <Icon icon="solar:camera-outline" className="icon" />
                          </label>
                        </div>
                        <div className="avatar-preview">
                          <div
                            id="imagePreview"
                            style={{
                              backgroundImage: imagePreviewUrl ? `url(${imagePreviewUrl})` : "",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={(e) => { e.preventDefault(); actualizarUsuario(); }}>
                      <div className="mb-20">
                        <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Nombre completo <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          id="name"
                          name="nombre"
                          placeholder="Ingrese el nombre completo"
                          value={usuario.nombre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-20">
                        <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Correo electrónico <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control radius-8"
                          id="email"
                          name="correo"
                          placeholder="Ingrese el correo electrónico"
                          value={usuario.correo}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-20">
                        <label htmlFor="contrasena" className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Contraseña {!userId && <span className="text-danger-600">*</span>}
                        </label>
                        <input
                          type="password"
                          className="form-control radius-8"
                          id="contrasena"
                          name="contrasena"
                          placeholder={userId ? "Dejar en blanco para mantener la actual" : "Ingrese la contraseña"}
                          value={usuario.contrasena}
                          onChange={handleInputChange}
                          required={!userId} // Solo es requerido para nuevos usuarios
                        />
                      </div>

                      <div className="mb-20">
                        <label htmlFor="organizacion" className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Organización
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          id="organizacion"
                          name="organizacion"
                          placeholder="Nombre de la organización"
                          value={usuario.organizacion}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-20">
                        <label htmlFor="rol" className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Rol
                        </label>
                        <select
                          className="form-control radius-8 form-select"
                          id="rol"
                          name="rol"
                          value={usuario.rol}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar rol</option>
                          <option value="admin">Admin</option>
                          <option value="proveedor">Proveedor</option>
                          <option value="cliente">Cliente</option>
                          <option value="dueno">Dueño</option>
                        </select>
                      </div>

                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <button
                          type="button"
                          className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                          onClick={() => navigate("/usuarios")}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8 d-flex align-items-center justify-content-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Guardando...
                            </>
                          ) : (
                            "Actualizar"
                          )}
                        </button>
                      </div>

                      {error && (
                        <div className="mt-3 text-danger text-center">
                          {error}
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserLayer;