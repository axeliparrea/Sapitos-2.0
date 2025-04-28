import MasterLayout from "../../components/masterLayout";
import InvoiceListLayer from "../../components/InvoiceListLayer";

const Pedidos = () => {
  return (
    <>
      <MasterLayout role="admin">
        <InvoiceListLayer/>
      </MasterLayout>
    </>
  );
};

export default Pedidos;