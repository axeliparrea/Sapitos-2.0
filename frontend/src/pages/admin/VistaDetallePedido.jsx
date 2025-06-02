import MasterLayout from "../../components/masterLayout";
import InvoicePreview from "../../components/InvoicePreview"; 

const InvoicePreviewPage = ({ aceptadas }) => {
  return (
    <>
      <MasterLayout role="admin">
        <InvoicePreview/>
      </MasterLayout>
    </>
  );
};

export default InvoicePreviewPage;