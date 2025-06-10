import MasterLayout from "../../components/masterLayout";
import UsersListLayer from "../../components/UsersListLayer";

const UsuariosShec = () => {
  return (
    <>
      <MasterLayout role="SuperAdmin">
        <div id="usuariosSuperAdmin">
          <UsersListLayer />
        </div>
      </MasterLayout>
    </>
  );
};

export default UsuariosShec; 