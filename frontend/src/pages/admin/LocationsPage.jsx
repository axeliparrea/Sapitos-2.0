import MasterLayout from "../../components/masterLayout";
import Locations from "../../components/roles/admin/Location";

const LocationsPage = () => {
  return (
    <MasterLayout role={1} tipoEmpleado={null}>
      <Locations />
    </MasterLayout>
  );
};

export default LocationsPage;
