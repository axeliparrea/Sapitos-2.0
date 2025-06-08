import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';

const UnitCountOne = ({ inventoryData }) => {
  const totalVentas = inventoryData ? inventoryData.reduce((acc, item) => acc + (item.PRECIOVENTA * item.EXPORTACION), 0) : 0;
  const totalOrdenes = inventoryData ? inventoryData.reduce((acc, item) => acc + item.EXPORTACION, 0) : 0;
  const productosVendidos = inventoryData ? inventoryData.filter(item => item.EXPORTACION > 0).length : 0;

  return (
    <div className='row row-cols-xxxl-6 row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 gy-4'>
      <div className='col' style={{ maxWidth: "260px" }}>
        <div className='card shadow-none border bg-gradient-start-1 h-100'>
          <div className='card-body p-3'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
              <div>
                <p className='fw-medium text-primary-light mb-1'>Ventas Totales</p>
                <h6 className='mb-0'>${totalVentas.toLocaleString()}</h6>
              </div>
              <div className='w-40-px h-40-px bg-cyan rounded-circle d-flex justify-content-center align-items-center'>
                <Icon icon='gridicons:multiple-users' className='text-white text-xl mb-0' />
              </div>
            </div>
            <p className='fw-medium text-sm text-primary-light mt-3 mb-0 d-flex align-items-center gap-2'>
              <span className='d-inline-flex align-items-center gap-1 text-success-main'>
                <Icon icon='bxs:up-arrow' className='text-xs' /> +8%
              </span>
              De Ayer
            </p>
          </div>
        </div>
      </div>

      <div className='col' style={{ maxWidth: "260px" }}>
        <div className='card shadow-none border bg-gradient-start-2 h-100'>
          <div className='card-body p-3'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
              <div>
                <p className='fw-medium text-primary-light mb-1'>Unidades Totales</p>
                <h6 className='mb-0'>{totalOrdenes}</h6>
              </div>
              <div className='w-40-px h-40-px bg-purple rounded-circle d-flex justify-content-center align-items-center'>
                <Icon icon='fa-solid:award' className='text-white text-xl mb-0' />
              </div>
            </div>
            <p className='fw-medium text-sm text-primary-light mt-3 mb-0 d-flex align-items-center gap-2'>
              <span className='d-inline-flex align-items-center gap-1 text-success-main'>
                <Icon icon='bxs:up-arrow' className='text-xs' /> +5%
              </span>
              De Ayer
            </p>
          </div>
        </div>
      </div>

      <div className='col' style={{ maxWidth: "260px" }}>
        <div className='card shadow-none border bg-gradient-start-3 h-100'>
          <div className='card-body p-3'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
              <div>
                <p className='fw-medium text-primary-light mb-1'>Artículos Vendidos</p>
                <h6 className='mb-0'>{productosVendidos}</h6>
              </div>
              <div className='w-40-px h-40-px bg-info rounded-circle d-flex justify-content-center align-items-center'>
                <Icon icon='fluent:people-20-filled' className='text-white text-xl mb-0' />
              </div>
            </div>
            <p className='fw-medium text-sm text-primary-light mt-3 mb-0 d-flex align-items-center gap-2'>
              <span className='d-inline-flex align-items-center gap-1 text-success-main'>
                <Icon icon='bxs:up-arrow' className='text-xs' /> +1.2%
              </span>
              De Ayer
            </p>
          </div>
        </div>
      </div>

      <div className='col' style={{ maxWidth: "260px" }}>
        <div className='card shadow-none border bg-gradient-start-4 h-100'>
          <div className='card-body p-3'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
              <div>
                <p className='fw-medium text-primary-light mb-1'>Nuevos Clientes</p>
                <h6 className='mb-0'>8</h6>
              </div>
              <div className='w-40-px h-40-px bg-success-main rounded-circle d-flex justify-content-center align-items-center'>
                <Icon icon='solar:wallet-bold' className='text-white text-xl mb-0' />
              </div>
            </div>
            <p className='fw-medium text-sm text-primary-light mt-3 mb-0 d-flex align-items-center gap-2'>
              <span className='d-inline-flex align-items-center gap-1 text-success-main'>
                <Icon icon='bxs:up-arrow' className='text-xs' /> +0,5%
              </span>
              De Ayer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

UnitCountOne.propTypes = {
  inventoryData: PropTypes.array
};

export default UnitCountOne;
