import MasterLayout from "../../components/masterLayout";
import Inventory from "../../components/Inventory";

const Inventario = () => {
  return (
    <>
      <MasterLayout role="dueno">
        <h1>Inventario</h1>
        <Inventory />
      </MasterLayout>
    </>
  );
};

export default Inventario;