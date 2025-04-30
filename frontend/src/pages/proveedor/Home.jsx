import MasterLayout from "../../components/masterLayout";
import Ordenes from "../../components/OrdenesProveedor";

const HomeProveedor = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout role="proveedor">
        
        <Ordenes/>

      </MasterLayout>
    </>
  );
};

export default HomeProveedor;
