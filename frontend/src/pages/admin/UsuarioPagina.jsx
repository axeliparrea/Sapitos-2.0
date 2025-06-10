import MasterLayout from "../../components/masterLayout";
import Usuarios from "../../components/roles/admin/Usuarios";

const UsuariosPagina = () => {
  return (
    <>
      <MasterLayout role="admin">
        <div id="usuariosAdmin"> {/* ID agregado aquí */}
          <Usuarios />
        </div>
      </MasterLayout>
    </>
  );
};
export default UsuariosPagina;
