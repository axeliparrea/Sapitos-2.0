import MasterLayout from "../components/masterLayout";
import InvoicePreview from "../components/InvoicePreview";

const InvoicePreviewPage = ({ aceptadas }) => {
  return (
    <>
      <MasterLayout>
        <InvoicePreview/>
      </MasterLayout>
    </>
  );
};

export default InvoicePreviewPage;