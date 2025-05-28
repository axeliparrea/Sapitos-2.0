import MasterLayout from "../../components/masterLayout";
import InvoiceListLayer from "../../components/InvoiceListLayer";

const Pedidos = () => {
  return (
    <>
      <MasterLayout role="admin">
        <div id="pedidosAdmin"> {/* ID agregado aquí */}
          <InvoiceListLayer />
        </div>
      </MasterLayout>
    </>
  );
};
export default Pedidos;