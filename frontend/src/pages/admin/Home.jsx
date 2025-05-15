import MasterLayout from "../../components/masterLayout";
import DashBoardLayerOne from "../../components/DashBoardLayerOne";

const HomePageOne = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout role="admin">
        {/* DashBoardLayerOne */}
        <DashBoardLayerOne />
      </MasterLayout>
    </>
  );
};

export default HomePageOne;

