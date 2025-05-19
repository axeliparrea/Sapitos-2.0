import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InvoiceAddLayer = () => {
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [pedidoID, setPedidoID] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEnviarPedido = async (productos, proveedorSeleccionado, total) => {
    if (productos.length === 0 || !proveedorSeleccionado || total <= 0) {
      setError("Por favor selecciona un proveedor y al menos un producto");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Filtrar productos con cantidad > 0
      const productosParaEnviar = productos
        .filter(producto => producto.cantidad > 0)
        .map(producto => ({
          id: producto.ID || producto.id,
          cantidad: producto.cantidad,
          precioUnitario: producto.precio || producto.PrecioCompra
        }));

      if (productosParaEnviar.length === 0) {
        setError("Por favor agrega al menos un producto al pedido");
        setIsSubmitting(false);
        return;
      }

      // Crear el pedido usando tu endpoint
      const response = await axios.post("http://localhost:5000/pedido", {
        creadaPor: proveedorSeleccionado, // El correo del proveedor
        productos: productosParaEnviar,
        total: total,
        metodoPago: "Transferencia", // Puedes hacer esto configurable
        descuentoAplicado: 0 // Puedes hacer esto configurable
      });

      setPedidoID(response.data.pedidoId);
      setPedidoEnviado(true);

      setTimeout(() => {
        navigate("/pedidos"); 
      }, 2500);
    } catch (err) {
      console.error("Error al enviar pedido:", err);
      setError(err.response?.data?.error || "Error al enviar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='card'>
      <EncabezadoFormulario isSubmitting={isSubmitting} />
      <div className='card-body py-40'>
        {error && (
          <div className='alert alert-danger text-sm mb-4'>
            <Icon icon='mdi:alert-circle-outline' className='me-2 text-lg' />
            {error}
          </div>
        )}
        {pedidoEnviado && (
          <div className='alert alert-success text-sm mb-4'>
            <Icon icon='mdi:check-circle-outline' className='me-2 text-lg' />
            Pedido #{pedidoID} enviado con éxito.
          </div>
        )}
        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <div className='shadow-4 border radius-8'>
              <InformacionPedido pedidoID={pedidoID} />
              <TablaProductos onEnviarPedido={handleEnviarPedido} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EncabezadoFormulario = ({ isSubmitting }) => (
  <div className='card-header'>
    <div className='d-flex flex-wrap align-items-center justify-content-between'>
      <h2 className='card-title mb-0'>Nuevo Pedido</h2>
    </div>
  </div>
);

const InformacionPedido = ({ pedidoID }) => {
  const fechaHoy = new Date().toLocaleDateString("es-MX");

  return (
    <div className='p-20 border-bottom'>
      <div className='row justify-content-between g-3'>
        <div className='col-sm-6'>
          <h3 className='text-xl'>Nuevo Pedido {pedidoID ? `#${pedidoID}` : ""}</h3>
          <p className='mb-1 text-sm'>
            Fecha: <span className='fw-semibold'>{fechaHoy}</span>
          </p>
        </div>
        <div className='col-sm-6 text-end'>
          <img src='assets/images/logo.png' alt='Logo' className='mb-8' />
        </div>
      </div>
    </div>
  );
};

const TablaProductos = ({ onEnviarPedido, isSubmitting }) => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar proveedores al inicio - MODIFICADO para usar el nuevo endpoint
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        // Actualizado para usar el nuevo endpoint de proveedores
        const response = await axios.get('http://localhost:5000/inventory/proveedores');
        // Como ahora la respuesta será un array de objetos con propiedad "proveedor"
        setProveedores(response.data || []);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };

    fetchProveedores();
  }, []);

  // Cargar productos cuando se selecciona un proveedor - MODIFICADO para usar el nuevo endpoint
  useEffect(() => {
    const fetchProductos = async () => {
      if (!proveedorSeleccionado) return;
      
      setLoading(true);
      try {
        // Actualizado para usar el nuevo endpoint para obtener productos por proveedor
        const response = await axios.get(`http://localhost:5000/inventory/proveedores/${proveedorSeleccionado}`);
        const productosConCantidad = (response.data || []).map(prod => ({
          ...prod,
          cantidad: 0,
        }));
        setProductos(productosConCantidad);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [proveedorSeleccionado]);

  const handleCantidadChange = (index, value) => {
    const nuevaCantidad = parseInt(value) || 0;
    const nuevosProductos = [...productos];
    nuevosProductos[index].cantidad = nuevaCantidad;
    setProductos(nuevosProductos);
  };

  const calcularSubtotal = () => {
    return productos.reduce((total, producto) => {
      const precio = producto.precioCompra || producto.PrecioCompra || producto.precio || 0;
      return total + (precio * producto.cantidad);
    }, 0);
  };

  const subtotal = calcularSubtotal();
  const descuento = 0;
  const impuesto = 0;
  const total = subtotal - descuento + impuesto;

  return (
    <div className='py-28 px-20'>
      {/* Dropdown de proveedor */}
      <div className='mb-20 d-flex align-items-center gap-3'>
        <label className='text-sm fw-medium'>Proveedor:</label>
        <select
          className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'
          value={proveedorSeleccionado}
          onChange={(e) => setProveedorSeleccionado(e.target.value)}
        >
          <option value='' disabled>
            Selecciona un proveedor
          </option>
          {proveedores.map((p, index) => (
            // Actualizado para usar la propiedad "proveedor" del nuevo endpoint
            <option key={index} value={p.proveedor}>{p.proveedor}</option>
          ))}
        </select>
      </div>

      {/* Tabla de productos */}
      <div className='table-responsive scroll-sm'>
        <table className='table bordered-table text-sm'>
          <thead>
            <tr>
              <th>No.</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Stock Actual</th>
              <th>Precio Unitario</th>
              <th>Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan='6' className='text-center'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Cargando...</span>
                  </div>
                  <span className='ms-2'>Cargando productos...</span>
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan='6' className='text-center text-muted'>
                  {proveedorSeleccionado ? 'No hay productos disponibles' : 'Selecciona un proveedor para ver sus productos'}
                </td>
              </tr>
            ) : (
              productos.map((producto, idx) => {
                // Actualizado para manejar los diferentes formatos de propiedad
                const precio = producto.precioCompra || producto.PrecioCompra || producto.precio || 0;
                return (
                  <tr key={producto.id || producto.ID || idx}>
                    <td>{String(idx + 1).padStart(2, '0')}</td>
                    <td>{producto.nombre || producto.Nombre}</td>
                    <td>
                      <input
                        type='number'
                        min='0'
                        value={producto.cantidad}
                        onChange={(e) => handleCantidadChange(idx, e.target.value)}
                        className='form-control form-control-sm w-80-px'
                      />
                    </td>
                    <td>{producto.stockActual || producto.StockActual || 'N/A'}</td>
                    <td>${precio.toFixed(2)}</td>
                    <td>${(precio * producto.cantidad).toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen de Totales */}
      <div className='d-flex flex-wrap justify-content-between gap-3 mt-24'>
        <div>
          <p className='text-sm mb-0'>
            <span className='text-primary-light fw-semibold'>Vendido por:</span> Jammal
          </p>
          <p className='text-sm mb-0'>¡Gracias por su preferencia!</p>
        </div>
        <div>
          <table className='text-sm'>
            <tbody>
              <tr>
                <td className='pe-64'>Subtotal:</td>
                <td className='pe-16'>
                  <span className='text-primary-light fw-semibold'>
                    ${subtotal.toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className='pe-64'>Descuento:</td>
                <td className='pe-16'>
                  <span className='text-primary-light fw-semibold'>
                    $0.00
                  </span>
                </td>
              </tr>
              <tr>
                <td className='pe-64 border-bottom pb-4'>Impuesto:</td>
                <td className='pe-16 border-bottom pb-4'>
                  <span className='text-primary-light fw-semibold'>
                    $0.00
                  </span>
                </td>
              </tr>
              <tr>
                <td className='pe-64 pt-4'>
                  <span className='text-primary-light fw-semibold'>Total:</span>
                </td>
                <td className='pe-16 pt-4'>
                  <span className='text-primary-light fw-semibold'>
                    ${total.toFixed(2)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón de enviar pedido */}
      <div className='d-flex justify-content-end mt-24'>
        <button
          type='button'
          onClick={() => onEnviarPedido(productos, proveedorSeleccionado, total)}
          disabled={isSubmitting || !proveedorSeleccionado || productos.length === 0 || total <= 0}
          className='btn btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
        >
          {isSubmitting ? (
            <>
              <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              <span className='ms-2'>Procesando...</span>
            </>
          ) : (
            <>
              <Icon icon='mdi:send' className='text-xl' />
              Enviar Pedido
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InvoiceAddLayer;