import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pedido/${id}`);
        setPedido(response.data);
      } catch (error) {
        console.error("Error al obtener el pedido:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedido();
  }, [id]);

  if (loading) {
    return (
      <div className='card-body text-center py-5'>
        <Icon icon='mdi:loading' className='text-primary text-2xl animate-spin mb-3' />
        <p>Cargando detalles del pedido...</p>
      </div>
    );
  }

  const subtotal = pedido.productos.reduce((acc, p) => acc + p.precioCompra * p.cantidad, 0);

  return (
    <div className='card'>
      <div className='card-body py-40'>
        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <div className='shadow-4 border radius-8'>
              <div className='p-20 d-flex flex-wrap justify-content-between gap-3 border-bottom'>
                <div>
                  <h3 className='text-xl'>Pedido #{pedido.id}</h3>
                  <p className='mb-1 text-sm'>Fecha: {new Date(pedido.fechaCreacion).toLocaleDateString("es-MX")}</p>
                  <p className='mb-1 text-sm'>Solicitado por: {pedido.creadoPor}</p>
                  <p className='mb-0 text-sm'>Email: {pedido.correo}</p>
                </div>
                <div>
                  <h6 className='mb-0'>Proveedor</h6>
                  <p className='text-sm mb-0'>{pedido.proveedor.nombre}</p>
                </div>
              </div>
              <div className='py-28 px-20'>
                <div className='table-responsive scroll-sm'>
                  <table className='table bordered-table text-sm'>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th className='text-end'>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.productos.map((prod, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{prod.nombre}</td>
                          <td>{prod.categoria}</td>
                          <td>${prod.precioCompra.toFixed(2)}</td>
                          <td>{prod.cantidad}</td>
                          <td className='text-end'>${(prod.precioCompra * prod.cantidad).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='d-flex flex-wrap justify-content-between gap-3 mt-4'>
                  <div>
                    <p className='text-sm mb-0'>Gracias por tu pedido</p>
                  </div>
                  <div>
                    <table className='text-sm'>
                      <tbody>
                        <tr>
                          <td className='pe-64'>Subtotal:</td>
                          <td className='pe-16'>${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className='pe-64'>Descuento:</td>
                          <td className='pe-16'>-${pedido.descuentoAplicado.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className='pe-64 border-bottom pb-4'>Impuesto:</td>
                          <td className='pe-16 border-bottom pb-4'>$0.00</td>
                        </tr>
                        <tr>
                          <td className='pe-64 pt-4 fw-semibold'>Total:</td>
                          <td className='pe-16 pt-4 fw-semibold'>${pedido.total.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className='mt-64 text-center'>
                  <p className='text-secondary-light text-sm fw-semibold'>¡Gracias por tu compra!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
