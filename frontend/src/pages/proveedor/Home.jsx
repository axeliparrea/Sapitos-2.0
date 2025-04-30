import MasterLayout from "../../components/masterLayout";
import InvoiceListLayer from "../../components/InvoiceListLayer";

const HomeProveedor = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout role="proveedor">
        
        <InvoiceListLayer/>

      </MasterLayout>
    </>
  );
};

export default HomeProveedor;
