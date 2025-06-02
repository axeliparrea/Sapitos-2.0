import MasterLayout from "../../components/masterLayout";
import InvoiceListProveedor from "../../components/InvoiceListProveedor";

const InvoiceListProveedorPage = ({ aceptadas }) => {
  return (
    <>
      <MasterLayout role="proveedor">
        <InvoiceListProveedor aceptadas={aceptadas}/>
      </MasterLayout>
    </>
  );
};

export default InvoiceListProveedorPage;