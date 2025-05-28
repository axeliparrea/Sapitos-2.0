import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useUserSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users/getSession', {
          withCredentials: true
        });
        
        if (response.data && response.data.usuario) {
          setSession({
            userId: response.data.usuario.id,
            nombre: response.data.usuario.nombre,
            email: response.data.usuario.correo,
            rol: response.data.usuario.rol
          });
        }
      } catch (error) {
        console.error('Error al obtener sesión:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { session, loading };
};

const InvoiceAddLayer = () => {
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [pedidoID, setPedidoID] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const { session, loading: sessionLoading } = useUserSession();
  const navigate = useNavigate();

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        console.log('Intentando cargar proveedores...');
        const response = await axios.get('http://localhost:5000/pedido/proveedores');
        
        if (response.data && Array.isArray(response.data)) {
          setProveedores(response.data);
        } else {
          console.warn('La respuesta no contiene un array válido:', response.data);
          setProveedores([]);
          setError('Formato de datos inesperado de la API');
        }
      } catch (error) {
        console.error("Error detallado al obtener proveedores:", error);
        setError(`Error al cargar los proveedores: ${error.response?.data?.error || error.message}`);
        setProveedores([]);
      }
    };

    if (!sessionLoading) {
      fetchProveedores();
    }
  }, [sessionLoading]);

  const handleEnviarPedido = async (productos, proveedorSeleccionado, total) => {
    if (!session) {
      setError("Error: No se pudo obtener la información de sesión");
      return;
    }

    if (!proveedorSeleccionado) {
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
        articuloId: producto.id || producto.articuloId,
        cantidad: producto.cantidad,
        precio: producto.precioCompra || producto.precio,
        precioCompra: producto.precioCompra || producto.precio
      }));

      // Preparar datos según el formato esperado por el backend
      const pedidoData = {
        creadoPorId: session.userId,
        organizacion: proveedorSeleccionado, // Nombre del proveedor
        productos: productosFormateados,
        total: total,
        metodoPagoId: 1, // ID por defecto para transferencia
        descuentoAplicado: 0,
        tipoOrden: 'Compra'
      };

      console.log('Enviando pedido:', pedidoData);

      const response = await axios.post("http://localhost:5000/pedido", pedidoData);

      setPedidoID(response.data.pedidoId || response.data.id);
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

  if (sessionLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <Icon icon="mdi:loading" className="text-primary text-2xl animate-spin mb-3" />
          <p>Cargando información de sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <Icon icon="mdi:alert-circle" className="text-danger text-2xl mb-3" />
          <p>Error: No se pudo cargar la información de sesión</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='card'>
      <EncabezadoFormulario isSubmitting={isSubmitting} session={session} />
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
          <div className='col-lg-10'>
            <div className='shadow-4 border radius-8'>
              <InformacionPedido pedidoID={pedidoID} session={session} />
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

const EncabezadoFormulario = ({ isSubmitting, session }) => (
  <div className='card-header'>
    <div className='d-flex flex-wrap align-items-center justify-content-between'>
      <div>
        <h2 className='card-title mb-0'>Nuevo Pedido</h2>
        <small className='text-muted'>Creado por: {session?.nombre}</small>
      </div>
      {isSubmitting && (
        <div className='text-primary'>
          <Icon icon='mdi:loading' className='me-2 text-lg animate-spin' />
          Procesando...
        </div>
      )}
    </div>
  </div>
);

const InformacionPedido = ({ pedidoID, session }) => {
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className='p-20 border-bottom'>
      <div className='row justify-content-between g-3'>
        <div className='col-sm-6'>
          <h3 className='text-xl'>Pedido {pedidoID ? `#${pedidoID}` : "Nuevo"}</h3>
          <p className='mb-1 text-sm'>
            Fecha: <span className='fw-semibold'>{fechaHoy}</span>
          </p>
          <p className='mb-1 text-sm'>
            Solicitado por: <span className='fw-semibold'>{session?.nombre}</span>
          </p>
          <p className='mb-0 text-sm'>
            Email: <span className='fw-semibold'>{session?.email}</span>
          </p>
        </div>
        <div className='col-sm-6 text-end'>
          <div className='bg-light p-3 rounded'>
            <h6 className='mb-0'>Mi Empresa</h6>
            <small className='text-muted'>Sistema de Pedidos</small>
          </div>
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
          `http://localhost:5000/pedido/productos/${encodeURIComponent(proveedorSeleccionado)}`
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
      // Asegurar que el precio sea un número
      const precioNumerico = parseFloat(producto.precioCompra || producto.precio || 0);
      const cantidad = parseInt(producto.cantidad || 0);
      return total + (precioNumerico * cantidad);
    }, 0);
  };

  const subtotal = calcularSubtotal();
  const descuento = 0;
  const impuesto = 0;
  const total = subtotal - descuento + impuesto;

  const puedeEnviar = !isSubmitting && 
                     proveedorSeleccionado && 
                     productos.length > 0 && 
                     productos.some(p => p.cantidad > 0) && 
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
            onChange={handleProveedorChange}
            disabled={proveedores.length === 0}
          >
            <option value='' disabled>
              {proveedores.length === 0 ? 'Cargando proveedores...' : 'Selecciona un proveedor'}
            </option>
            {proveedores.map((proveedor, index) => {
              const nombreProveedor = proveedor.nombre || proveedor.NOMBRE || `Proveedor ${index + 1}`;
              return (
                <option key={index} value={nombreProveedor}>
                  {nombreProveedor} ({proveedor.totalProductos || 0} productos)
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
          <div className='row'>
            <div className='col-sm-6'>
              <small className='text-muted'>
                <strong>Productos seleccionados:</strong> {productosConCantidad.length}
              </small>
            </div>
            <div className='col-sm-6 text-end'>
              <small className='text-muted'>
                <strong>Total estimado:</strong> ${total.toFixed(2)}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      {productos.length > 0 && (
        <div className='table-responsive mt-4'>
          <table className='table table-striped'>
            <thead className='table-dark'>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Precio Compra</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => {
                const precio = producto.precioCompra || producto.precio || 0;
                const subtotalProducto = precio * producto.cantidad;
                
                return (
                  <tr key={index} className={producto.cantidad > 0 ? 'table-success' : ''}>
                    <td>
                      <div>
                        <strong>{producto.nombre || 'Sin nombre'}</strong>
                        {producto.temporada && (
                          <small className='d-block text-muted'>
                            Temporada: {producto.temporada}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>{producto.categoria || 'N/A'}</td>
                    <td>
                      <span className={producto.stockActual <= 10 ? 'text-danger' : 'text-success'}>
                        {producto.stockActual || 0}
                      </span>
                    </td>
                    <td>
                      <strong>${precio.toFixed(2)}</strong>
                    </td>
                    <td>
                      <input
                        type='number'
                        min='0'
                        max={producto.stockActual || 999}
                        value={producto.cantidad}
                        onChange={(e) => handleCantidadChange(index, e.target.value)}
                        className='form-control'
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <strong>${subtotalProducto.toFixed(2)}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen de totales y botón de enviar */}
      {productos.length > 0 && (
        <div className='mt-4'>
          <div className='row justify-content-end'>
            <div className='col-sm-6'>
              <div className='card'>
                <div className='card-body'>
                  <h6 className='card-title'>Resumen del Pedido</h6>
                  <div className='d-flex justify-content-between mb-2'>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className='d-flex justify-content-between mb-2'>
                    <span>Descuento:</span>
                    <span>-${descuento.toFixed(2)}</span>
                  </div>
                  <div className='d-flex justify-content-between mb-2'>
                    <span>Impuesto:</span>
                    <span>${impuesto.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-between mb-3'>
                    <strong>Total:</strong>
                    <strong className='text-primary'>${total.toFixed(2)}</strong>
                  </div>
                  <button
                    className='btn btn-primary w-100'
                    onClick={() => onEnviarPedido(productos, proveedorSeleccionado, total)}
                    disabled={!puedeEnviar}
                  >
                    {isSubmitting ? (
                      <>
                        <Icon icon='mdi:loading' className='me-2 animate-spin' />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Icon icon='mdi:send' className='me-2' />
                        Enviar Pedido
                      </>
                    )}
                  </button>
                  {!puedeEnviar && !isSubmitting && (
                    <small className='text-muted d-block mt-2'>
                      {!proveedorSeleccionado && 'Selecciona un proveedor. '}
                      {productos.length === 0 && 'Carga productos. '}
                      {productosConCantidad.length === 0 && productos.length > 0 && 'Selecciona al menos un producto.'}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay productos */}
      {proveedorSeleccionado && !loading && productos.length === 0 && !errorProductos && (
        <div className='text-center py-5'>
          <Icon icon='mdi:package-variant' className='text-muted text-3xl mb-3' />
          <p className='text-muted'>No se encontraron productos para el proveedor seleccionado.</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceAddLayer;