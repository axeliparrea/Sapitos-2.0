import MasterLayout from "../../components/masterLayout";

const OrdenesEmpleado = () => {
  return (
    <MasterLayout role={3}>
      <div className="p-4">
        <h2>Órdenes (Empleado)</h2>
        <p>Visualiza o gestiona órdenes según tu tipo de empleado: proveedor, almacén o sucursal.</p>
      </div>
    </MasterLayout>
  );
};

export default OrdenesEmpleado;
