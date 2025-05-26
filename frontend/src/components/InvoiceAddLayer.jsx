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
        console.log('Intentando cargar proveedores...'); // Debug
        const response = await axios.get('http://localhost:5000/pedido/inventory/proveedor');
        console.log('Respuesta de proveedores:', response.data); // Debug
        
        // Verificar que la respuesta tenga datos válidos
        if (response.data && Array.isArray(response.data)) {
          setProveedores(response.data);
          console.log('Proveedores cargados:', response.data.length); // Debug
        } else {
          console.warn('La respuesta no contiene un array válido:', response.data);
          setProveedores([]);
        }
      } catch (error) {
        console.error("Error detallado al obtener proveedores:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        setError(`Error al cargar los proveedores: ${error.message}`);
        setProveedores([]);
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
      const productosFormateados = productosParaEnviar.map(producto => ({
        id: producto.ID || producto.id,
        cantidad: producto.cantidad,
        precioUnitario: producto.precio || producto.PrecioCompra
      }));

      const response = await axios.post("http://localhost:5000/pedidos", {
        creadaPor: proveedorId, // Corregido: usar proveedorId en lugar de proveedorSeleccionado
        productos: productosFormateados,
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
  const [errorProductos, setErrorProductos] = useState(null);

  // Debug: Mostrar información de proveedores
  useEffect(() => {
    console.log('Proveedores recibidos en TablaProductos:', proveedores);
    console.log('Cantidad de proveedores:', proveedores.length);
    // Debug detallado de la estructura de cada proveedor
    proveedores.forEach((proveedor, index) => {
      console.log(`Proveedor ${index}:`, proveedor);
      console.log(`Keys del proveedor ${index}:`, Object.keys(proveedor));
    });
  }, [proveedores]);

  useEffect(() => {
    const fetchProductos = async () => {
      if (!proveedorSeleccionado) {
        setProductos([]);
        return;
      }

      setLoading(true);
      setErrorProductos(null);
      
      try {
        console.log('Cargando productos para proveedor:', proveedorSeleccionado);
        const response = await axios.get(
          `http://localhost:5000/pedido/inventory/proveedores/${encodeURIComponent(proveedorSeleccionado)}`
        );
        const productosConCantidad = (response.data || []).map(prod => ({
          ...prod,
          cantidad: 0,
        }));
        setProductos(productosConCantidad);
        console.log('Productos cargados:', productosConCantidad.length);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setErrorProductos("Error al cargar los productos del proveedor");
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
    console.log('Proveedor seleccionado:', nuevoProveedor);
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
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className='mb-3 p-2 bg-info text-white rounded text-sm'>
          <strong>Debug:</strong> {proveedores.length} proveedores disponibles
          {proveedores.length === 0 && ' - No hay proveedores cargados'}
        </div>
      )}

      <div className='mb-20 d-flex justify-content-end'>
        <div style={{ width: '300px' }}>
          <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
            Proveedor <span className='text-danger-600'>*</span>
          </label>
          <select
            className='form-select radius-8 px-12 py-10 text-sm'
            value={proveedorSeleccionado}
            onChange={handleProveedorChange}
            disabled={proveedores.length === 0}
          >
            <option value='' disabled>
              {proveedores.length === 0 ? 'Cargando proveedores...' : 'Selecciona un proveedor'}
            </option>
            {proveedores.map((proveedor, index) => {
              // Manejar diferentes estructuras de datos del proveedor
              let nombreProveedor;
              
              if (typeof proveedor === 'string') {
                nombreProveedor = proveedor;
              } else if (typeof proveedor === 'object' && proveedor !== null) {
                // Buscar posibles propiedades que contengan el nombre
                nombreProveedor = proveedor.proveedor || 
                                proveedor.nombre || 
                                proveedor.Proveedor || 
                                proveedor.Nombre ||
                                proveedor.name ||
                                proveedor.Name ||
                                `Proveedor ${index + 1}`; // Fallback
              } else {
                nombreProveedor = `Proveedor ${index + 1}`;
              }
              
              // Asegurar que nombreProveedor sea string
              const nombreFinal = String(nombreProveedor);
              
              return (
                <option key={index} value={nombreFinal}>
                  {nombreFinal}
                </option>
              );
            })}
          </select>
          {proveedores.length === 0 && (
            <small className='text-muted mt-1 d-block'>
              No se encontraron proveedores. Verifica la conexión con el servidor.
            </small>
          )}
        </div>
      </div>

      {/* Mostrar error de productos si existe */}
      {errorProductos && (
        <div className='alert alert-warning text-sm mb-4'>
          <Icon icon='mdi:alert-circle-outline' className='me-2 text-lg' />
          {errorProductos}
        </div>
      )}

      {/* Mostrar loading de productos */}
      {loading && (
        <div className='text-center py-4'>
          <Icon icon='mdi:loading' className='text-lg animate-spin me-2' />
          Cargando productos...
        </div>
      )}

      {/* Resumen de productos seleccionados */}
      {productosConCantidad.length > 0 && (
        <div className='mt-3 p-3 bg-light rounded'>
          <small className='text-muted'>
            <strong>Resumen:</strong> {productosConCantidad.length} producto(s) seleccionado(s)
          </small>
        </div>
      )}

      {/* Tabla de productos */}
      {productos.length > 0 && (
        <div className='table-responsive mt-4'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => {
                const precio = producto.precioCompra || producto.PrecioCompra || producto.precio || 0;
                const subtotalProducto = precio * producto.cantidad;
                
                return (
                  <tr key={index}>
                    <td>{producto.nombre || producto.Nombre || producto.descripcion || 'Sin nombre'}</td>
                    <td>${precio.toFixed(2)}</td>
                    <td>
                      <input
                        type='number'
                        min='0'
                        value={producto.cantidad}
                        onChange={(e) => handleCantidadChange(index, e.target.value)}
                        className='form-control'
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>${subtotalProducto.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Total y botón de enviar */}
      {productos.length > 0 && (
        <div className='mt-4 text-end'>
          <div className='mb-3'>
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
          <button
            className='btn btn-primary'
            onClick={() => onEnviarPedido(productos, proveedorSeleccionado, total)}
            disabled={!puedeEnviar}
          >
            {isSubmitting ? (
              <>
                <Icon icon='mdi:loading' className='me-2 animate-spin' />
                Enviando...
              </>
            ) : (
              'Enviar Pedido'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceAddLayer;