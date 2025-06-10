import MasterLayout from "../../components/masterLayout";
import NotificationsLayer from "../../components/NotificationsLayer";

const NotificacionesSuperAdmin = () => {
  return (
    <>
      <MasterLayout role="SuperAdmin">
        <div id="notificacionesSuperAdmin">
          <NotificationsLayer />
        </div>
      </MasterLayout>
    </>
  );
};

export default NotificacionesSuperAdmin; 