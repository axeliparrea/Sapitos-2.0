import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const InvoiceAddLayer = () => {
  return (
    <div className='card'>
      <EncabezadoFormulario />
      <div className='card-body py-40'>
        <div className='row justify-content-center' id='invoice'>
          <div className='col-lg-8'>
            <div className='shadow-4 border radius-8'>
              <InformacionFactura />
              <TablaProductos />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EncabezadoFormulario = () => (
  <div className='card-header'>
    <div className='d-flex flex-wrap align-items-center justify-content-end gap-2'>
      <button
        type='button'
        className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
      >
        <Icon icon='simple-line-icons:check' className='text-xl' />
        Guardar
      </button>
    </div>
  </div>
);

const InformacionFactura = () => (
  <div className='p-20 border-bottom'>
    <div className='row justify-content-between g-3'>
      <div className='col-sm-4'>
        <h3 className='text-xl'>Pedido #3492</h3>
        <p className='mb-1 text-sm'>
          Fecha de Pedido:{" "}
          <span className='editable text-decoration-underline'>25/08/2020</span>{" "}
          <span className='text-success-main'><Icon icon='mage:edit' /></span>
        </p>
      </div>
      <div className='col-sm-4'>
        <img src='assets/images/logo.png' alt='Logo' className='mb-8' />
        <p className='mb-0 text-sm'>random@gmail.com, +1 543 2198</p>
      </div>
    </div>
    <div className='d-flex flex-wrap justify-content-between align-items-end gap-3 mt-24'>
      <div>
        <h6 className='text-md'>A nombre de:</h6>
        <table className='text-sm text-secondary-light'>
          <tbody>
            <tr>
              <td>Nombre</td>
              <td className='ps-8'>: Will Marthas <span className='text-success-main'><Icon icon='mage:edit' /></span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div></div>
    </div>
  </div>
);

const TablaProductos = () => (
  <div className='py-28 px-20'>
    <div className='table-responsive scroll-sm'>
      <table className='table bordered-table text-sm' id='invoice-table'>
        <thead>
          <tr>
            <th>No.</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Precio Unitario</th>
            <th>Precio Total</th>
            <th className='text-center'>Acción</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map((num) => (
            <tr key={num}>
              <td>{String(num).padStart(2, '0')}</td>
              <td>Zapatos de Apple</td>
              <td>5</td>
              <td>PC</td>
              <td>$200</td>
              <td>$1000.00</td>
              <td className='text-center'>
                <button type='button' className='remove-row'>
                  <Icon icon='ic:twotone-close' className='text-danger-main text-xl' />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div>
      <button
        type='button'
        id='addRow'
        className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1 mt-3'
      >
        <Icon icon='simple-line-icons:plus' className='text-xl' />
        Agregar Producto
      </button>
    </div>
  </div>
);

export default InvoiceAddLayer;
