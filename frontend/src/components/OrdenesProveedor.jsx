import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from "axios";
import Swal from "sweetalert2";

const OrdenesProveedor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener el ID del proveedor (ajusta según tu sistema de autenticación)
  const proveedorId = localStorage.getItem("proveedorId") || "proveedor-1";

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/pedido/proveedor/${proveedorId}`);
      
      // Filtrar solo pedidos pendientes
      const pedidosPendientes = response.data
        .filter(pedido => pedido.estatus === "Pendiente")
        .map((pedido, index) => ({
          id: `#${pedido.id}`,
          idOriginal: pedido.id, // Guardamos el ID sin formato para las llamadas
          cliente: pedido.cliente || "Tienda",
          fecha: formatDate(pedido.fechaCreacion),
          cantidad: pedido.total
        }));
      
      setPedidos(pedidosPendientes);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const aceptarPedido = async (pedidoId) => {
    try {
      const result = await Swal.fire({
        title: "¿Confirmar envío?",
        text: "Al aceptar, el estado cambiará a 'En Reparto'",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar"
      });
      
      if (result.isConfirmed) {
        // Llamada al backend para actualizar el estado
        await axios.patch(`http://localhost:5000/pedido/${pedidoId}/estado`, {
          nuevoEstado: "En Reparto"
        });
        
        Swal.fire("¡Listo!", "El pedido está ahora En Reparto", "success");
        fetchPedidos(); // Refrescar la lista
      }
    } catch (error) {
      console.error("Error al aceptar pedido:", error);
      Swal.fire("Error", "No se pudo actualizar el pedido", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Pedidos Pendientes</h4>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : pedidos.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Cantidad</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido, index) => (
                    <tr key={index}>
                      <td>{pedido.id}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.fecha}</td>
                      <td>{pedido.cantidad} unidades</td>
                      <td>
                        <button
                          onClick={() => aceptarPedido(pedido.idOriginal)}
                          className="btn btn-sm btn-success"
                          title="Marcar como En Reparto"
                        >
                          <Icon icon="mdi:truck-delivery" className="me-1" />
                          Aceptar Envío
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info mb-0">
              No tienes pedidos pendientes por aceptar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdenesProveedor;