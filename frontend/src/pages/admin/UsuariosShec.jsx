import MasterLayout from "../../components/masterLayout";
import Usuarios from "../../components/roles/admin/Usuarios";

const UsuariosShec = () => {
  return (
    <MasterLayout role={1} tipoEmpleado={null}>
      <Usuarios />
    </MasterLayout>
  );
};

export default UsuariosShec;
