import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InvoiceAddLayer = () => {
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [pedidoID, setPedidoID] = useState(null);
  const navigate = useNavigate();

  const handleEnviarPedido = () => {
    const nuevoID = generarIDPedido();
    setPedidoID(nuevoID);
    setPedidoEnviado(true);

    // Simulamos que el pedido se guarda correctamente
    setTimeout(() => {
      navigate("/pedidos"); // Redireccionar a la página de pedidos
    }, 2500); // Redirige después de 2.5 segundos
  };

  const generarIDPedido = () => {
    const random = Math.floor(Math.random() * 900000) + 100000; // Genera un número de 6 dígitos
    return `#${random}`;
  };

  return (
    <div className='card'>
      <EncabezadoFormulario onEnviar={handleEnviarPedido} />
      <div className='card-body py-40'>
        {pedidoEnviado && (
          <div className='alert alert-success text-sm mb-4'>
            <Icon icon='mdi:check-circle-outline' className='me-2 text-lg' />
            Pedido {pedidoID} enviado con éxito.
          </div>
        )}
        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <div className='shadow-4 border radius-8'>
              <InformacionPedido pedidoID={pedidoID} />
              <TablaProductos />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EncabezadoFormulario = ({ onEnviar }) => (
  <div className='card-header'>
    <div className='d-flex flex-wrap align-items-center justify-content-end gap-2'>
      <button
        type='button'
        onClick={onEnviar}
        className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
      >
        <Icon icon='mdi:send' className='text-xl' />
        Enviar Pedido
      </button>
    </div>
  </div>
);

const InformacionPedido = ({ pedidoID }) => {
  const fechaHoy = new Date().toLocaleDateString("es-MX");

  return (
    <div className='p-20 border-bottom'>
      <div className='row justify-content-between g-3'>
        <div className='col-sm-6'>
          <h3 className='text-xl'>Nuevo Pedido {pedidoID ? pedidoID : ""}</h3>
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

const TablaProductos = () => {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [productos, setProductos] = useState([]);

  const proveedores = [
    "GUCCI", "ZARA", "Bershka", "Tommy Hilfiger", "Michael Kors",
    "Pull&Bear", "H&M", "Calvin Klein", "Stradivarius", "Levi's"
  ];

  useEffect(() => {
    const fetchProductos = async () => {
      if (!proveedorSeleccionado) return;

      try {
        const response = await axios.get(`http://localhost:5000/products/by-provider?name=${proveedorSeleccionado}`);
        const productosConCantidad = (response.data || []).map(prod => ({
          ...prod,
          cantidad: 0,
        }));
        setProductos(productosConCantidad);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProductos([]);
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
    return productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
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
          {proveedores.map((p, idx) => (
            <option key={idx} value={p}>{p}</option>
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
              <th>Unidad</th>
              <th>Precio Unitario</th>
              <th>Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan='6' className='text-center text-muted'>
                  Selecciona un proveedor para ver sus productos
                </td>
              </tr>
            ) : (
              productos.map((producto, idx) => (
                <tr key={producto.id || idx}>
                  <td>{String(idx + 1).padStart(2, '0')}</td>
                  <td>{producto.nombre}</td>
                  <td>
                    <input
                      type='number'
                      min='0'
                      value={producto.cantidad}
                      onChange={(e) => handleCantidadChange(idx, e.target.value)}
                      className='form-control form-control-sm w-80-px'
                    />
                  </td>
                  <td>{producto.unidad}</td>
                  <td>${producto.precio}</td>
                  <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                </tr>
              ))
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
    </div>
  );
};

export default InvoiceAddLayer;
