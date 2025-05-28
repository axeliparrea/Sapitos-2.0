import MasterLayout from "../../components/masterLayout";
import Inventory from "../../components/Inventory";

const Inventario = () => {
  return (
    <>
      <MasterLayout role="admin">
        <div id="inventarioAdmin"> {/* ID agregado para pruebas */}
          <h1>Inventario</h1>
          <Inventory />
        </div>
      </MasterLayout>
    </>
  );
};

export default Inventario;