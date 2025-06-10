import MasterLayout from "../../components/masterLayout";
import Usuarios from "../../components/roles/admin/Usuarios";

const UsuariosShec = () => {
  return (
    <>
      <MasterLayout role="admin">
        <div id="usuariosAdmin"> {/* ID agregado aquí */}
          <UsersListLayer />
        </div>
      </MasterLayout>
    </>
  );
};
export default UsuariosShec;
