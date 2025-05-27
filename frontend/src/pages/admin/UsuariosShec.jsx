import MasterLayout from "../../components/masterLayout";
import UsersListLayer from "../../components/UsersListLayer";

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