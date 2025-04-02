import MasterLayout from "../../components/masterLayout";
import InvoiceListLayer from "../../components/InvoiceListLayer";

const InvoiceListPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout role="admin">

        {/* InvoiceListLayer */}
        <InvoiceListLayer />
      </MasterLayout>
    </>
  );
};

export default InvoiceListPage;
