import MasterLayout from "../../components/masterLayout";
import InvoiceListLayer from "../../components/InvoiceListLayer";

const Pedidos = () => {
  return (
    <>
      <MasterLayout role="dueno">
        <div id="pedidosDueno"> {/* ID agregado aquí */}
          <InvoiceListLayer />
        </div>
      </MasterLayout>
    </>
  );
};
export default Pedidos;
