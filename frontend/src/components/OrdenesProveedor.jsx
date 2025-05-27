import { useState } from "react";

const OrdenesProveedor = () => {
  // Datos hardcodeados de los productos relacionados con los pedidos
  const datosProductos = [
    {
      "id": 1,
      "proveedor": "ProveeTex",
      "nombre": "Playera Básica S",
      "categoria": "Playera",
      "stockActual": 120,
      "stockMinimo": 30,
      "fechaUltimaCompra": "2025-04-01",
      "fechaUltimaVenta": null,
      "precioCompra": null,
      "precioVenta": null
    },
    {
      "id": 2,
      "proveedor": "ProveeTex",
      "nombre": "Playera Básica S",
      "categoria": "Playera",
      "stockActual": 120,
      "stockMinimo": 30,
      "fechaUltimaCompra": "2025-04-01",
      "fechaUltimaVenta": "2025-04-20",
      "precioCompra": "50",
      "precioVenta": "100"
    },
    {
      "id": 3,
      "proveedor": "ProveeTex",
      "nombre": "Playera Básica M",
      "categoria": "Playera",
      "stockActual": 100,
      "stockMinimo": 25,
      "fechaUltimaCompra": "2025-04-01",
      "fechaUltimaVenta": "2025-04-19",
      "precioCompra": "50",
      "precioVenta": "100"
    },
    {
      "id": 4,
      "proveedor": "ProveeTex",
      "nombre": "Playera Básica G",
      "categoria": "Playera",
      "stockActual": 80,
      "stockMinimo": 20,
      "fechaUltimaCompra": "2025-04-01",
      "fechaUltimaVenta": "2025-04-18",
      "precioCompra": "50",
      "precioVenta": "100"
    }
  ];

  // Datos hardcodeados para los pedidos pendientes basados en los productos
  const pedidosHardcoded = [
    {
      id: "#PED-01",
      idOriginal: "PED-01",
      cliente: "Tienda Central",
      fecha: "28/04/2025",
      cantidad: 30,
      producto: "Playera Básica S",
      proveedor: "ProveeTex"
    },
    {
      id: "#PED-02",
      idOriginal: "PED-02",
      cliente: "Tienda Norte",
      fecha: "29/04/2025",
      cantidad: 25,
      producto: "Playera Básica M",
      proveedor: "ProveeTex"
    },
    {
      id: "#PED-03",
      idOriginal: "PED-03",
      cliente: "Tienda Sur",
      fecha: "30/04/2025",
      cantidad: 20,
      producto: "Playera Básica G",
      proveedor: "ProveeTex"
    }
  ];

  const [pedidos, setPedidos] = useState(pedidosHardcoded);
  const [loading, setLoading] = useState(false);

  const aceptarPedido = (pedidoId) => {
    // Simulamos la confirmación y la eliminación del pedido de la lista
    if (window.confirm("¿Confirmar envío? Al aceptar, el estado cambiará a 'En Reparto'")) {
      setPedidos(pedidos.filter(pedido => pedido.idOriginal !== pedidoId));
      alert("¡Listo! El pedido está ahora En Reparto");
    }
  };

  const rechazarPedido = (pedidoId) => {
    // Simulamos la confirmación y la eliminación del pedido de la lista
    if (window.confirm("¿Seguro que desea rechazar este pedido? Esta acción no se puede deshacer.")) {
      setPedidos(pedidos.filter(pedido => pedido.idOriginal !== pedidoId));
      alert("Pedido rechazado correctamente");
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
                    <th>Producto</th>
                    <th>Fecha</th>
                    <th>Cantidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.idOriginal}>
                      <td>{pedido.id}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.producto}</td>
                      <td>{pedido.fecha}</td>
                      <td>{pedido.cantidad} unidades</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            id={`aceptarPedido-${pedido.idOriginal}`}
                            onClick={() => aceptarPedido(pedido.idOriginal)}
                            className="btn btn-sm btn-success"
                            title="Marcar como En Reparto"
                          >
                            <i className="bi bi-truck me-1"></i>
                            Aceptar
                          </button>
                          <button
                            id={`rechazarPedido-${pedido.idOriginal}`}
                            onClick={() => rechazarPedido(pedido.idOriginal)}
                            className="btn btn-sm btn-danger ms-2"
                            title="Rechazar Pedido"
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Rechazar
                          </button>
                        </div>
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

      {/* Sección de Inventario */}
      <div className="card mt-4">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">Inventario de Productos</h4>
        </div>
        
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Precio Compra</th>
                  <th>Precio Venta</th>
                  <th>Última Compra</th>
                </tr>
              </thead>
              <tbody>
                {datosProductos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.categoria}</td>
                    <td className={
                      producto.stockActual <= producto.stockMinimo 
                        ? "text-danger fw-bold" 
                        : "text-success"
                    }>
                      {producto.stockActual}
                    </td>
                    <td>{producto.stockMinimo}</td>
                    <td>{producto.precioCompra ? `$${producto.precioCompra}` : '-'}</td>
                    <td>{producto.precioVenta ? `$${producto.precioVenta}` : '-'}</td>
                    <td>{producto.fechaUltimaCompra || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdenesProveedor;