import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

const AddUserLayer = () => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [locations, setLocations] = useState([]);
  const API_BASE_URL = "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    organizacion: "",
    contrasena: "",
    rol: "",
    location_id: "",
    diasordenprom: 0,
    valorordenprom: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch locations from the backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/locations`);
        setLocations(response.data);
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
        setError("Error al cargar ubicaciones");
      }
    };

    fetchLocations();
  }, []);

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
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const agregarUsuario = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(nuevoUsuario)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar usuario');
    }

    navigate("/usuarios");
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    setError('Error al agregar usuario: ' + error.message);
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

                {/* Upload Image */}
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
                          backgroundImage: imagePreviewUrl
                            ? `url(${imagePreviewUrl})`
                            : "",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    agregarUsuario();
                  }}
                >
                  <div className="mb-20">
                    <label
                      htmlFor="name"
                      className="form-label fw-semibold text-primary-light text-sm mb-8"
                    >
                      Nombre completo <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="nombreInput"
                      name="nombre"
                      placeholder="Ingrese el nombre completo"
                      value={nuevoUsuario.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold text-primary-light text-sm mb-8"
                    >
                      Correo electrónico{" "}
                      <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control radius-8"
                      id="emailInput"
                      name="correo"
                      placeholder="Ingrese el correo electrónico"
                      value={nuevoUsuario.correo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label
                      htmlFor="contrasena"
                      className="form-label fw-semibold text-primary-light text-sm mb-8"
                    >
                      Contraseña <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control radius-8"
                      id="contrasenaInput"
                      name="contrasena"
                      placeholder="Ingrese la contraseña"
                      value={nuevoUsuario.contrasena}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label
                      htmlFor="organizacion"
                      className="form-label fw-semibold text-primary-light text-sm mb-8"
                    >
                      Organización
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="organizacionInput"
                      name="organizacion"
                      placeholder="Nombre de la organización"
                      value={nuevoUsuario.organizacion}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-20">
                    <label
                      htmlFor="rol"
                      className="form-label fw-semibold text-primary-light text-sm mb-8"
                    >
                      Rol <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8 form-select"
                      id="rolSelect"
                      name="rol"
                      value={nuevoUsuario.rol}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="admin">Admin</option>
                      <option value="proveedor">Proveedor</option>
                      <option value="cliente">Cliente</option>
                      <option value="dueno">Dueño</option>
                    </select>
                  </div>

                  {/* Location Dropdown */}
                  {nuevoUsuario.rol === "proveedor" && (
                    <div className="mb-20">
                      <label
                        htmlFor="location_id"
                        className="form-label fw-semibold text-primary-light text-sm mb-8"
                      >
                        Ubicación <span className="text-danger-600">*</span>
                      </label>
                      <select
                        className="form-control radius-8 form-select"
                        id="locationSelect"
                        name="location_id"
                        value={nuevoUsuario.location_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar ubicación</option>
                        {locations.map((location) => (
                          <option
                            key={location.Location_ID}
                            value={location.Location_ID}
                          >
                            {location.Location_ID} - {location.Nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button
                      id="cancelarBtn"
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={() => window.history.back()}
                    >
                      Cancelar
                    </button>

                    <button
                      id="guardarBtn"
                      type="submit"
                      className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8 d-flex align-items-center justify-content-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Guardando...
                        </>
                      ) : (
                        "Guardar"
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-3 text-danger text-center">{error}</div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserLayer;