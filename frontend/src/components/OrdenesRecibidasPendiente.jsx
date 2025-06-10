import React, { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from 'axios';
import Cookies from 'js-cookie';

const OrdenesRecibidas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [detalles, setDetalles] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookieData = Cookies.get('UserData');
        if (!cookieData) throw new Error('No se encontró la cookie del usuario');
        const user = JSON.parse(decodeURIComponent(cookieData));
        const locationId = user.LOCATION_ID || user.locationId;

        const res = await axios.get(`http://localhost:5000/ordenes/recibidas/${locationId}`, {
          withCredentials: true
        });

        // Filtrar por estado "pendiente"
        const ordenesPendientes = res.data.filter(o =>
          o.ESTADO?.toLowerCase() === 'pendiente'
        );

        // Obtener nombre y tipo de quien envió cada orden
        const ordenesConNombre = await Promise.all(
          ordenesPendientes.map(async (orden) => {
            if (!orden.CREADO_POR_ID) {
              return { ...orden, CREADO_POR_NOMBRE: 'Ubicación desconocida', CREADO_POR_TIPO: '' };
            }

            try {
  const locRes = await axios.get(`http://localhost:5000/location2/getByID/${orden.CREADO_POR_ID}`);
  console.log("📦 Location data:", locRes.data);

  return {
    ...orden,
    CREADO_POR_NOMBRE: locRes.data?.location?.NOMBRE || 'Ubicación desconocida',
    CREADO_POR_TIPO: locRes.data?.TIPO || ''
  };
} catch (e) {
  return { ...orden, CREADO_POR_NOMBRE: 'Ubicación desconocida', CREADO_POR_TIPO: '' };
}

          })
        );

        setPedidos(ordenesConNombre);
        setFiltered(ordenesConNombre);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDetalle = async (ordenId) => {
    if (detalles[ordenId]) {
      const nuevos = { ...detalles };
      delete nuevos[ordenId];
      setDetalles(nuevos);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/ordenesProductos/getByOrdenID/${ordenId}`);
      const productos = res.data;

      const detalleConNombre = await Promise.all(
        productos.map(async (p) => {
          try {
            const invRes = await axios.get(`http://localhost:5000/inventory/${p.Inventario_ID}`, {
              withCredentials: true
            });

            return {
              ...p,
              articuloNombre: invRes.data?.NOMBRE || 'NA'
            };
          } catch (error) {
            console.error("Error obteniendo nombre del inventario:", error);
            return { ...p, articuloNombre: 'NA' };
          }
        })
      );

      setDetalles(prev => ({ ...prev, [ordenId]: detalleConNombre }));
    } catch (err) {
      console.error("Error al obtener detalle de orden:", err);
    }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const result = pedidos.filter(p =>
      p.ORDEN_ID.toString().includes(lower) ||
      p.TIPOORDEN?.toLowerCase().includes(lower) ||
      p.ESTADO?.toLowerCase().includes(lower) ||
      p.ORGANIZACION?.toLowerCase().includes(lower)
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [searchTerm, pedidos]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentItems = filtered.slice(idxFirst, idxLast);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  if (loading) return <div className="text-center p-4">Cargando pedidos...</div>;

  return (
    <div className='card h-100 p-0 radius-12'>
      <div className='card-header d-flex justify-content-between align-items-center py-16 px-24'>
        <div className='icon-field'>
          <input
            type='text'
            className='form-control form-control-sm'
            style={{ minWidth: '280px' }}
            placeholder='Buscar pedidos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className='icon'><Icon icon='ion:search-outline' /></span>
        </div>
      </div>

      <div className='card-body p-24'>
        <div className="table-responsive scroll-sm">
          <Table bordered hover size="sm">
            <thead style={{ backgroundColor: '#e0e0e0' }}>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Organización</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Enviado por</th>
                <th>Inventario ID</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map(p => (
                <React.Fragment key={p.ORDEN_ID}>
                  <tr>
                    <td>{p.ORDEN_ID}</td>
                    <td>{p.TIPOORDEN}</td>
                    <td>{p.ORGANIZACION}</td>
                    <td>{formatDate(p.FECHACREACION)}</td>
                    <td>
                      <Badge bg={p.ESTADO === 'Completado' ? 'success' : 'warning'}>{p.ESTADO}</Badge>
                    </td>
                    <td>
                      ${isNaN(parseFloat(p.TOTAL)) ? '0.00' : parseFloat(p.TOTAL).toFixed(2)}{' '}
                      <Button variant="link" size="sm" onClick={() => fetchDetalle(p.ORDEN_ID)}>
                        <Icon icon={detalles[p.ORDEN_ID] ? "mdi:chevron-up" : "mdi:chevron-down"} />
                      </Button>
                    </td>
                    <td>{p.CREADO_POR_NOMBRE} <small className="text-muted">({p.CREADO_POR_TIPO})</small></td>
                    <td>{detalles[p.ORDEN_ID]?.[0]?.Inventario_ID ?? '—'}</td>
                  </tr>

                  {detalles[p.ORDEN_ID]?.map((item, i) => (
                    <tr key={`detalle-${p.ORDEN_ID}-${i}`} className="bg-light">
                      <td colSpan="2" className="ps-5">🛒 {item.articuloNombre}</td>
                      <td>Inventario ID: {item.Inventario_ID}</td>
                      <td>Cantidad: {item.Cantidad}</td>
                      <td>Precio: ${item.PrecioUnitario?.toFixed(2) ?? '0.00'}</td>
                      <td colSpan="2">
                        Total: ${isNaN(item.Cantidad * item.PrecioUnitario) ? '0.00' : (item.Cantidad * item.PrecioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )) : (
                <tr><td colSpan="8" className="text-center">No se encontraron pedidos</td></tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Mostrando {idxFirst + 1} a {Math.min(idxLast, filtered.length)} de {filtered.length} pedidos
          </small>
          <div>
            <Button variant="outline-secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="me-2">
              <Icon icon="mdi:chevron-left" width="16" />
            </Button>
            <span>Página {currentPage} de {totalPages}</span>
            <Button variant="outline-secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="ms-2">
              <Icon icon="mdi:chevron-right" width="16" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdenesRecibidas;
