import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserPerfil = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ correo: "", nombre: "", contrasena: "", rol: "", username: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const apiUrl = "http://localhost:5000";
        const response = await fetch(`${apiUrl}/users/getSession`, {
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          navigate("/");
          return;
        }
        const data = await response.json();
        if (data.usuario) {
          setUser(data.usuario);
          setForm({
            correo: data.usuario.correo,
            nombre: data.usuario.nombre,
            contrasena: "",
            rol: data.usuario.rol,
            username: data.usuario.username || ""
          });
          setIsAdmin(data.usuario.rol === "admin");
          try {
            const imageResponse = await fetch(`${apiUrl}/users/${data.usuario.correo}/profileImage`, {
              credentials: "include",
              headers: {
                'Accept': 'application/octet-stream, image/*',
              }
            });
            if (imageResponse.ok) {
              const arrayBuffer = await imageResponse.arrayBuffer();
              if (arrayBuffer.byteLength > 0) {
                const uint8Array = new Uint8Array(arrayBuffer);
                const blob = new Blob([uint8Array], { type: 'image/jpeg' });
                setProfileImage(URL.createObjectURL(blob));
              }
            }
          } catch {}
          
        } else {
          navigate("/");
        }
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    return () => {
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [navigate, profileImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const apiUrl = "http://localhost:5000";
      // 1. Update user info
      const response = await fetch(`${apiUrl}/users/updateUser`, {
        method: 'PUT',
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
      let imageUploadSuccess = true;
      // 2. If a new image was selected, upload it
      if (selectedImageFile) {
        const arrayBuffer = await selectedImageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageData = Array.from(uint8Array);
        const imgRes = await fetch(`${apiUrl}/users/updateProfileImage`, {
          method: 'POST',
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: form.correo,
            imageData,
            contentType: selectedImageFile.type
          })
        });
        imageUploadSuccess = imgRes.ok;
      }
      if (response.ok && imageUploadSuccess) {
        setUser(prev => ({ ...prev, ...form }));
        setIsEditing(false);
        setSelectedImageFile(null);
        // Refresh profile image from backend
        try {
          const imageResponse = await fetch(`${apiUrl}/users/${form.correo}/profileImage`, {
            credentials: "include",
            headers: {
              'Accept': 'application/octet-stream, image/*',
            }
          });
          if (imageResponse.ok) {
            const arrayBuffer = await imageResponse.arrayBuffer();
            if (arrayBuffer.byteLength > 0) {
              const uint8Array = new Uint8Array(arrayBuffer);
              const blob = new Blob([uint8Array], { type: 'image/jpeg' });
              setProfileImage(URL.createObjectURL(blob));
            }
          }
        } catch {}
        alert('Perfil actualizado correctamente');
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (error) {
      alert('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    setForm({
      correo: user.correo,
      nombre: user.nombre,
      contrasena: "",
      rol: user.rol,
      username: user.username || ""
    });
    setIsEditing(false);
    setSelectedImageFile(null);
    // Optionally reset profileImage to the last saved one
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "400px"}}>
        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card mt-4 mb-4">
        <div className="card-header">
          <h2 className="card-title">Mi Perfil</h2>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">No se pudo cargar la información del usuario.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4 mb-4" style={{maxWidth: 600, margin: "0 auto"}}>
      <div className="card-header">
        <h3 className="card-title">Mi Perfil</h3>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <label className="form-label">Imagen de perfil</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img 
              src={profileImage || "/assets/images/user.png"} 
              alt="Perfil" 
              className="rounded-circle"
              style={{ width: 64, height: 64, objectFit: 'cover' }}
            />
            {isEditing && (
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="form-control" 
                style={{ width: 'auto' }}
              />
            )}
          </div>
          {!isEditing && (
            <small className="form-text text-muted">Haz clic en "Editar Perfil" para cambiar tu imagen.</small>
          )}
        </div>
        
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input 
            type="email" 
            name="correo"
            value={form.correo} 
            onChange={handleInputChange}
            disabled={!isEditing} 
            className="form-control" 
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input 
            type="text" 
            name="nombre"
            value={form.nombre} 
            onChange={handleInputChange}
            disabled={!isEditing} 
            className="form-control" 
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input 
            type="text" 
            name="username"
            value={form.username} 
            onChange={handleInputChange}
            disabled={!isEditing} 
            className="form-control" 
          />
        </div>

        {isEditing && (
          <div className="mb-3">
            <label className="form-label">Nueva Contraseña (opcional)</label>
            <input 
              type="password" 
              name="contrasena"
              value={form.contrasena} 
              onChange={handleInputChange}
              className="form-control"
              placeholder="Dejar vacío si no deseas cambiarla"
            />
          </div>
        )}
        
        <div className="mb-3">
          <label className="form-label">Rol</label>
          <input 
            type="text" 
            name="rol"
            value={form.rol} 
            onChange={handleInputChange}
            disabled={!isEditing || !isAdmin} 
            className="form-control" 
          />
          {!isAdmin && (
            <small className="form-text text-muted">Solo los administradores pueden cambiar roles.</small>
          )}
        </div>
        
        <div className="card-footer">
          {!isEditing ? (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          ) : (
            <div>
              <button 
                className="btn btn-success me-2" 
                onClick={handleSave}
              >
                Guardar
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        
        <hr />
        
        
      </div>
    </div>
  );
};

export default UserPerfil;