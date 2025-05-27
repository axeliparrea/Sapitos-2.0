import MasterLayout from "../../components/masterLayout";
import InvoiceListProveedor from "../../components/InvoiceListProveedor";

const Pedidos = () => {
  return (
    <>
      <MasterLayout role="admin">
        <InvoiceListProveedor/>
      </MasterLayout>
    </>
  );
};

export default Pedidos;