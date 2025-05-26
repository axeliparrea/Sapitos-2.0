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

      const response = await axios.post("http://localhost:5000/pedidos", {
        creadaPor: proveedorSeleccionado,
        productos: productosParaEnviar,
        total: total,
        metodoPago: "Transferencia",
        descuentoAplicado: 0
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

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/inventory/proveedor');
        setProveedores(response.data || []);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };

    fetchProveedores();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      if (!proveedorSeleccionado) return;

      setLoading(true);
      try {
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
      <div className='mb-20 d-flex justify-content-end'>
        <div style={{ width: '300px' }}>
          <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
            Proveedor <span className='text-danger-600'>*</span>
          </label>
          <select
            className='form-select radius-8 px-12 py-10 text-sm'
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value='' disabled>
              Selecciona un proveedor
            </option>
            {proveedores.map((p, index) => (
              <option key={index} value={p.proveedor}>{p.proveedor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen de productos seleccionados */}
      {productosConCantidad.length > 0 && (
        <div className='mt-3 p-3 bg-light rounded'>
          <small className='text-muted'>
            <strong>Resumen:</strong> {productosConCantidad.length} producto(s) seleccionado(s)
          </small>
        </div>
      )}

      {/* ... resto sin cambios ... */}

    </div>
  );
};

export default InvoiceAddLayer;
