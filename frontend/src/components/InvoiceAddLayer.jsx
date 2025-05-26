import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InvoiceAddLayer = () => {
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [pedidoID, setPedidoID] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const navigate = useNavigate();

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/pedido/proveedores');
        setProveedores(response.data || []);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
        setError("Error al cargar los proveedores");
      }
    };
    fetchProveedores();
  }, []);

  const handleEnviarPedido = async (productos, proveedorId, total) => {
    if (!proveedorId) {
      setError("Debe seleccionar un proveedor");
      return;
    }

    // Filtrar productos con cantidad mayor a 0
    const productosParaEnviar = productos.filter(p => p.cantidad > 0);
    
    if (productosParaEnviar.length === 0) {
      setError("Debe agregar al menos un producto con cantidad mayor a 0");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Obtener el proveedor seleccionado
      const proveedor = proveedores.find(p => p.ID === proveedorId || p.proveedor === proveedorId);
      
      if (!proveedor) {
        throw new Error("Proveedor no encontrado");
      }

      // Preparar los productos para el envío
      const productosFormateados = productosParaEnviar.map(producto => ({
        id: producto.id || producto.ID,
        nombre: producto.nombre || producto.Nombre,
        cantidad: producto.cantidad,
        precio: producto.precioCompra || producto.PrecioCompra || producto.precio || 0,
        total: (producto.precioCompra || producto.PrecioCompra || producto.precio || 0) * producto.cantidad
      }));

      const response = await axios.post("http://localhost:5000/pedidos", {
        creadaPor: proveedor.UsuarioAsociado || proveedor.usuario || "Sistema",
        proveedorId: proveedorId,
        productos: productosFormateados,
        total: total,
        metodoPago: "Transferencia",
        descuentoAplicado: 0,
        fecha: new Date().toISOString()
      });

      if (response.data && response.data.id) {
        setPedidoID(response.data.id);
        setPedidoEnviado(true);
        // Limpiar error si existía
        setError(null);
      }
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      setError(error.response?.data?.message || "Error al enviar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNuevoPedido = () => {
    setPedidoEnviado(false);
    setPedidoID(null);
    setError(null);
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
            <button 
              className='btn btn-sm btn-outline-success ms-3'
              onClick={handleNuevoPedido}
            >
              Crear Nuevo Pedido
            </button>
          </div>
        )}
        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <div className='shadow-4 border radius-8'>
              <InformacionPedido pedidoID={pedidoID} />
              <TablaProductos 
                onEnviarPedido={handleEnviarPedido} 
                isSubmitting={isSubmitting}
                proveedores={proveedores}
                pedidoEnviado={pedidoEnviado}
              />
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
      {isSubmitting && (
        <div className='text-primary'>
          <Icon icon='mdi:loading' className='me-2 text-lg animate-spin' />
          Procesando...
        </div>
      )}
    </div>
  </div>
);

const InformacionPedido = ({ pedidoID }) => {
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

const TablaProductos = ({ onEnviarPedido, isSubmitting, proveedores, pedidoEnviado }) => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar productos cuando se selecciona un proveedor
  useEffect(() => {
    const fetchProductos = async () => {
      if (!proveedorSeleccionado) {
        setProductos([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/proveedores/${proveedorSeleccionado}/productos`
        );
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

  // Resetear cuando se envía un pedido exitosamente
  useEffect(() => {
    if (pedidoEnviado) {
      setProveedorSeleccionado("");
      setProductos([]);
    }
  }, [pedidoEnviado]);

  const handleProveedorChange = (e) => {
    const nuevoProveedor = e.target.value;
    setProveedorSeleccionado(nuevoProveedor);
    // Resetear productos cuando cambia el proveedor
    setProductos([]);
  };

  const handleCantidadChange = (index, value) => {
    const nuevaCantidad = Math.max(0, parseInt(value) || 0);
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

  const productosConCantidad = productos.filter(p => p.cantidad > 0);
  const puedeEnviar = !isSubmitting && 
                      proveedorSeleccionado && 
                      productos.length > 0 && 
                      productosConCantidad.length > 0 && 
                      total > 0;

  return (
    <div className='py-28 px-20'>
      {/* Dropdown de proveedor */}
      <div className='mb-20 d-flex align-items-center gap-3'>
        <label className='text-sm fw-medium'>Proveedor:</label>
        <select
          className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'
          value={proveedorSeleccionado}
          onChange={handleProveedorChange}
          disabled={isSubmitting}
        >
          <option value='' disabled>
            Selecciona un proveedor
          </option>
          {proveedores.map((proveedor, index) => (
            <option key={proveedor.ID || index} value={proveedor.ID || proveedor.proveedor}>
              {proveedor.Nombre || proveedor.proveedor} 
              {proveedor.Contacto && ` (${proveedor.Contacto})`}
            </option>
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
                <td colSpan='6' className='text-center py-4'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Cargando...</span>
                  </div>
                  <span className='ms-2'>Cargando productos...</span>
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan='6' className='text-center text-muted py-4'>
                  {proveedorSeleccionado ? 'No hay productos disponibles' : 'Selecciona un proveedor para ver sus productos'}
                </td>
              </tr>
            ) : (
              productos.map((producto, idx) => {
                const precio = producto.precioCompra || producto.PrecioCompra || producto.precio || 0;
                const stock = producto.stockActual || producto.StockActual;
                
                return (
                  <tr key={producto.id || producto.ID || idx}>
                    <td>{String(idx + 1).padStart(2, '0')}</td>
                    <td>{producto.nombre || producto.Nombre}</td>
                    <td>
                      <input
                        type='number'
                        min='0'
                        max={stock || 999}
                        value={producto.cantidad}
                        onChange={(e) => handleCantidadChange(idx, e.target.value)}
                        className='form-control form-control-sm w-80-px'
                        disabled={isSubmitting}
                      />
                    </td>
                    <td>
                      <span className={stock <= 10 ? 'text-warning fw-bold' : ''}>
                        {stock || 'N/A'}
                      </span>
                    </td>
                    <td>${precio.toFixed(2)}</td>
                    <td className='fw-semibold'>
                      ${(precio * producto.cantidad).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen de productos seleccionados */}
      {productosConCantidad.length > 0 && (
        <div className='mt-3 p-3 bg-light rounded'>
          <small className='text-muted'>
            <strong>Resumen:</strong> {productosConCantidad.length} producto(s) seleccionado(s)
          </small>
        </div>
      )}

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
                    ${descuento.toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className='pe-64 border-bottom pb-4'>Impuesto:</td>
                <td className='pe-16 border-bottom pb-4'>
                  <span className='text-primary-light fw-semibold'>
                    ${impuesto.toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className='pe-64 pt-4'>
                  <span className='text-primary-light fw-semibold'>Total:</span>
                </td>
                <td className='pe-16 pt-4'>
                  <span className='text-primary-light fw-semibold text-lg'>
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
          disabled={!puedeEnviar}
          className={`btn radius-8 d-inline-flex align-items-center gap-1 ${
            puedeEnviar ? 'btn-primary-600' : 'btn-secondary'
          }`}
          title={!puedeEnviar ? 'Selecciona un proveedor y agrega productos para continuar' : ''}
        >
          {isSubmitting ? (
            <>
              <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              <span className='ms-2'>Procesando...</span>
            </>
          ) : (
            <>
              <Icon icon='mdi:send' className='text-xl' />
              Enviar Pedido ({productosConCantidad.length} productos)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InvoiceAddLayer;