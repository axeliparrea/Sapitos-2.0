import MasterLayout from "../../components/masterLayout";
import InventarioDueno from "../../components/InventarioDueno"; // Renombra aquí

const Inventario = () => {
  return (
    <MasterLayout role="dueno">
      <InventarioDueno />
    </MasterLayout>
  );
};

export default Inventario;
