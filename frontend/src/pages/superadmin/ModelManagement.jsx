import React from "react";
import MasterLayout from "../../components/masterLayout";
import ModelManagementContent from "../../pages/admin/ModelManagement";

const ModelManagementSuperAdmin = () => {
  return (
    <MasterLayout role="SuperAdmin">
      <ModelManagementContent />
    </MasterLayout>
  );
};

export default ModelManagementSuperAdmin; 