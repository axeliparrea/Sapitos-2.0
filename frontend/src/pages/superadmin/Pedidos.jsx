import MasterLayout from "../../components/masterLayout";
import InvoiceListLayer from "../../components/InvoiceListLayer";

const PedidosSuperAdmin = () => {
  return (
    <>
      <MasterLayout role="SuperAdmin">
        <div id="pedidosSuperAdmin">
          <InvoiceListLayer />
        </div>
      </MasterLayout>
    </>
  );
};

export default PedidosSuperAdmin; 