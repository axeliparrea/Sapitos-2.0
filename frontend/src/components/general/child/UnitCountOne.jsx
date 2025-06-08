import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';

const UnitCountOne = ({ kpiData, inventoryData }) => {

  const totalVentas = kpiData && kpiData.ventas && kpiData.ventas.length > 0
    ? kpiData.ventas.reduce((acc, item) => acc + parseFloat(item.VENTAS_TOTALES), 0)
    : 0;

  const totalUnidades = kpiData && kpiData.unidades && kpiData.unidades.length > 0
    ? kpiData.unidades.reduce((acc, item) => acc + parseInt(item.STOCK_TOTAL, 10), 0)
    : 0;
  
  const totalArticulos = kpiData && kpiData.articulos ? kpiData.articulos.TOTAL_ARTICULOS : 0;

  const totalClientes = kpiData && kpiData.clientes && kpiData.clientes.length > 0
    ? kpiData.clientes.reduce((acc, item) => acc + parseInt(item.CLIENTES_ACTIVOS, 10), 0)
    : 0;


  return (
    <div className='row row-cols-xxxl-6 row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 gy-4'>
      <div className='col' style={{ maxWidth: "260px" }}>
        <div className='card shadow-none border bg-gradient-start-1 h-100'>
          <div className='card-body p-3'>
            <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
              <div>
                <p className='fw-medium text-primary-light mb-1'>Ventas</p>
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
                <p className='fw-medium text-primary-light mb-1'>Unidades</p>
                <h6 className='mb-0'>{totalUnidades}</h6>
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
                <p className='fw-medium text-primary-light mb-1'>Artículos</p>
                <h6 className='mb-0'>{totalArticulos}</h6>
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
                <p className='fw-medium text-primary-light mb-1'>Clientes</p>
                <h6 className='mb-0'>{totalClientes}</h6>
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
  inventoryData: PropTypes.array,
  kpiData: PropTypes.object
};

export default UnitCountOne;
