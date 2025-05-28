import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const UserMenu = ({ name = "Usuario", role = "Invitado", profileImage = "assets/images/user.png", onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/logoutUser", {
        method: "POST",
        credentials: "include", // Ensures cookies are included in the request
      });

      if (!response.ok) throw new Error("Logout failed");

      navigate("/"); // Redirect to login or home page
    } catch (error) {
      console.error("Error during logout:", error);
      alert("No se pudo cerrar sesión.");
    }
  };

  return (
    <div className="col-auto">
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="dropdown">
          <button
            id="userbutton"
            className="d-flex justify-content-center align-items-center rounded-circle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <img
              src={profileImage}
              alt="image_user"
              className="w-40-px h-40-px object-fit-cover rounded-circle"
            />
          </button>
          <div className="dropdown-menu to-top dropdown-menu-sm">
            <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
              <div>
                <h6 className="text-lg text-primary-light fw-semibold mb-2">{name}</h6>
                <span className="text-secondary-light fw-medium text-sm">{role}</span>
              </div>
              <button  id="tache" type="button" className="hover-text-danger" onClick={onClose}>
                <Icon icon="radix-icons:cross-1" className="icon text-xl" />
              </button>
            </div>
            <ul className="to-top-list">
              <li>
                <Link
                  id="userMenuProfile"
                  className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                  to="#"
                >
                  <Icon icon="solar:user-linear" className="icon text-xl" /> Mi Perfil
                </Link>
              </li>
              <li>
                <button
                  id="logoutButton"
                  className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 w-100 border-0 bg-transparent"
                  onClick={handleLogout}
                >
                  <Icon icon="lucide:power" className="icon text-xl" /> Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
