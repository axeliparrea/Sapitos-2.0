import MasterLayout from "../../components/masterLayout";
import NotificationsLayer from "../../components/NotificationsLayer";

const Notificaciones = () => {
  return (
    <>
      <MasterLayout role="admin">
        <div id="notificacionesAdmin">
          <NotificationsLayer />
        </div>
      </MasterLayout>
    </>
  );
};

export default Notificaciones; 