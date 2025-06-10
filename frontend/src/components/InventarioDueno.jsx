import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { Icon } from "@iconify/react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [locationTipo, setLocationTipo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryAndArticles = async () => {
      try {
        setLoading(true);
        const cookieData = Cookies.get('UserData');
        if (!cookieData) throw new Error('No se encontró la cookie del usuario');
        const user = JSON.parse(decodeURIComponent(cookieData));
        const locationId = user.LOCATION_ID || user.locationId;
        
        if (!locationId) throw new Error('No se encontró el ID de ubicación del usuario');

        // Obtener tipo de ubicación
        const locationRes = await axios.get(`http://localhost:5000/location2/getByID/${locationId}`, {
          withCredentials: true
        });
        setLocationTipo(locationRes.data?.TIPO || '');

        // Obtener inventario
        const inventoryRes = await axios.get(`http://localhost:5000/inventory/location/${locationId}`, {
          withCredentials: true
        });

        const inventoryData = inventoryRes.data;

        // Obtener artículos
        const articulosRes = await axios.get(`http://localhost:5000/articulo`, {
          withCredentials: true
        });

        const articulosData = articulosRes.data;

        // Crear mapa de artículos
        const articulosMap = {};
        articulosData.forEach(art => {
          articulosMap[art.ARTICULO_ID] = {
  PRECIOVENTA: art.PRECIOVENTA,
  TEMPORADA: art.TEMPORADA,
};

        });

        // Combinar y normalizar datos
        const mergedData = inventoryData.map(inv => {
          const articuloId = inv.ARTICULO_ID ?? inv.articuloId;
          return {
            ...inv,
            ARTICULO_ID: articuloId,
            INVENTARIO_ID: inv.INVENTARIO_ID ?? inv.inventarioId,
            NOMBRE: inv.NOMBRE ?? inv.nombre ?? inv.ArticuloNombre,
            CATEGORIA: inv.CATEGORIA ?? inv.categoria,
            LOCATION_NOMBRE: inv.LOCATION_NOMBRE ?? inv.locationNombre,
            LOCATION_TIPO: inv.LOCATION_TIPO ?? inv.locationTipo,
            STOCKACTUAL: inv.STOCKACTUAL ?? inv.stockActual,
            STOCKMINIMO: inv.STOCKMINIMO ?? inv.stockMinimo,
            STOCKRECOMENDADO: inv.STOCKRECOMENDADO ?? inv.stockRecomendado,
            PRECIOVENTA: articulosMap[articuloId]?.PRECIOVENTA || null,
            TEMPORADA: articulosMap[articuloId]?.TEMPORADA || null,
          };
        });

        setInventory(mergedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el inventario: ' + err.message);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryAndArticles();
  }, []);

  const formatCurrency = (value) => `$${parseFloat(value || 0).toFixed(2)}`;

  const filteredItems = inventory.filter(item =>
    item.NOMBRE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.CATEGORIA?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentItems = filteredItems.slice(idxFirst, idxLast);

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentItems.map(item => item.INVENTARIO_ID);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  if (loading) return <div className="text-center p-4">Cargando inventario...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className='card h-100 p-3'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mb-0'>Inventario</h5>
        <input
          type='text'
          placeholder='Buscar producto...'
          className='form-control w-auto'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead className='table-secondary'>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                />
              </th>
              <th>ID Inv.</th>
              <th>ID Art.</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Stock Recomendado</th>
              <th>Precio Venta</th>
              <th>Temporada</th>
              {['Proveedor', 'Almacén', 'Sucursal'].includes(locationTipo) && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => {
              const statusClass =
                item.STOCKACTUAL < item.STOCKMINIMO ? 'table-danger' :
                item.STOCKACTUAL >= item.STOCKMINIMO * 2 ? 'table-success' : '';

              return (
                <tr key={`inv-${item.INVENTARIO_ID}`} className={statusClass}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedItems.includes(item.INVENTARIO_ID)}
                      onChange={() => handleSelectItem(item.INVENTARIO_ID)}
                    />
                  </td>
                  <td>{item.INVENTARIO_ID}</td>
                  <td>{item.ARTICULO_ID}</td>
                  <td>{item.NOMBRE}</td>
                  <td>{item.CATEGORIA}</td>
                  <td>{item.LOCATION_NOMBRE}</td>
                  <td>{item.STOCKACTUAL}</td>
                  <td>{item.STOCKMINIMO}</td>
                  <td>{item.STOCKRECOMENDADO}</td>
                  <td>{formatCurrency(item.PRECIOVENTA)}</td>
                  <td>{item.TEMPORADA}</td>
                  {['Proveedor', 'Almacén', 'Sucursal'].includes(locationTipo) && (
  <td>
    <Button
      size="sm"
      variant="primary" // azul con texto blanco
      onClick={() =>
        navigate(
          locationTipo === 'Proveedor' ? '/crear-producto' : '/pedir-producto',
          { state: { inventario: item } }
        )
      }
    >
      {locationTipo === 'Proveedor' ? 'Crear producto' : 'Pedir producto'}
    </Button>
  </td>
)}


                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Inventory;
