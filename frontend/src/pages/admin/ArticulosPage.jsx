import MasterLayout from "../../components/masterLayout";
import Articulos from "../../components/roles/admin/Articulos";

const ArticulosPage = () => (
  <MasterLayout role={1} tipoEmpleado={null}>
    <Articulos />
  </MasterLayout>
);

export default ArticulosPage;
