import MasterLayout from "../../components/masterLayout";

import Roles from "../../components/roles/admin/Roles";

const RolesPage = () => {
  return (
    <MasterLayout role={1} tipoEmpleado={null}>
      <Roles />
    </MasterLayout>
  );
};

export default RolesPage;
