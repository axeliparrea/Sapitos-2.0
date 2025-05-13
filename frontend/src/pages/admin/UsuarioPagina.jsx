import MasterLayout from "../../components/masterLayout";
import Usuarios from "../../components/roles/admin/Usuarios";

const UsuariosPagina = () => {
  return (
    <>
      <MasterLayout role="admin">
        <Usuarios />
      </MasterLayout>
    </>
  );
};

export default UsuariosPagina;