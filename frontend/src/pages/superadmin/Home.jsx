import MasterLayout from "../../components/masterLayout";
import DashBoardLayerOne from "../../components/DashBoardLayerOne";

const HomeSuperAdmin = () => {
  return (
    <>
      <MasterLayout role="SuperAdmin">
        <div id="homeSuperAdminPage">
          <DashBoardLayerOne />
        </div>
      </MasterLayout>
    </>
  );
};

export default HomeSuperAdmin; 