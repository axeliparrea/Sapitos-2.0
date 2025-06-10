import MasterLayout from "../../components/masterLayout";
import InvoicePreview from "../../components/InvoicePreview"; 

const InvoicePreviewPage = ({ aceptadas }) => {
  return (
    <>
      <MasterLayout role="SuperAdmin">
        <InvoicePreview/>
      </MasterLayout>
    </>
  );
};

export default InvoicePreviewPage; 