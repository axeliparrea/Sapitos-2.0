import MasterLayout from "../../components/masterLayout";
import DashBoardLayerOne from "../../components/DashBoardLayerOne";


const HomeAdmin = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout role="admin">
        <DashBoardLayerOne />
      </MasterLayout>
    </>
  );
};

export default HomeAdmin;
