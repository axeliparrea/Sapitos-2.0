import MasterLayout from "../../components/masterLayout";
import DashBoardLayerOne from "../../components/DashBoardLayerOne";

const HomeAdmin = () => {
  return (
    <MasterLayout role={1} tipoEmpleado={null}>
      <DashBoardLayerOne />
    </MasterLayout>
  );
};

export default HomeAdmin;
