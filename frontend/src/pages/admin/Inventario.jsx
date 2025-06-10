import MasterLayout from "../../components/masterLayout";
import Inventory from "../../components/Inventory";

const Inventario = () => {
  return (
    <>      <MasterLayout role="admin">
        <div id="inventarioAdmin"> {/* ID agregado para pruebas */}
          <Inventory />
        </div>
      </MasterLayout>
    </>
  );
};

export default Inventario;