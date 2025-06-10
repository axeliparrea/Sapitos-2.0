import MasterLayout from "../../components/masterLayout";
import Inventory from "../../components/Inventory";

const InventarioSuperAdmin = () => {
  return (
    <>
      <MasterLayout role="SuperAdmin">
        <div id="inventarioSuperAdmin">
          <Inventory />
        </div>
      </MasterLayout>
    </>
  );
};

export default InventarioSuperAdmin; 