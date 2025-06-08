import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';

const KpiCard = ({ title, value, change, icon, gradient, formatAsCurrency = false }) => {
  const isPositive = change >= 0;
  const formattedValue = formatAsCurrency 
    ? `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : parseInt(value).toLocaleString();

  return (
    <div className='col' style={{ maxWidth: "260px" }}>
      <div className={`card shadow-none border ${gradient} h-100`}>
        <div className='card-body p-3'>
          <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
            <div>
              <p className='fw-medium text-primary-light mb-1'>{title}</p>
              <h6 className='mb-0'>{formattedValue}</h6>
            </div>
            <div className='w-40-px h-40-px bg-primary rounded-circle d-flex justify-content-center align-items-center'>
              <Icon icon={icon} className='text-white text-xl mb-0' />
            </div>
          </div>
          <p className='fw-medium text-sm text-primary-light mt-3 mb-0 d-flex align-items-center gap-2'>
            <span className={`d-inline-flex align-items-center gap-1 ${isPositive ? 'text-success-main' : 'text-danger-main'}`}>
              <Icon icon={isPositive ? 'bxs:up-arrow' : 'bxs:down-arrow'} className='text-xs' /> {change.toFixed(1)}%
            </span>
            Del Mes Pasado
          </p>
        </div>
      </div>
    </div>
  );
};

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  change: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  gradient: PropTypes.string.isRequired,
  formatAsCurrency: PropTypes.bool,
};


const UnitCountOne = ({ kpiData }) => {
  return (
    <div className='row row-cols-xxxl-6 row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 gy-4'>
      <KpiCard
        title="Ventas"
        value={kpiData?.ventas?.total || 0}
        change={kpiData?.ventas?.percentage_change || 0}
        icon="solar:wallet-bold"
        gradient="bg-gradient-start-1"
        formatAsCurrency={true}
      />
      <KpiCard
        title="Unidades"
        value={kpiData?.unidades?.total || 0}
        change={kpiData?.unidades?.percentage_change || 0}
        icon="fa-solid:award"
        gradient="bg-gradient-start-2"
      />
      <KpiCard
        title="Artículos"
        value={kpiData?.articulos?.total || 0}
        change={kpiData?.articulos?.percentage_change || 0}
        icon="fluent:box-20-filled"
        gradient="bg-gradient-start-3"
      />
      <KpiCard
        title="Clientes"
        value={kpiData?.clientes?.total || 0}
        change={kpiData?.clientes?.percentage_change || 0}
        icon="fluent:people-20-filled"
        gradient="bg-gradient-start-4"
      />
    </div>
  );
};

UnitCountOne.propTypes = {
  kpiData: PropTypes.shape({
    ventas: PropTypes.object,
    unidades: PropTypes.object,
    articulos: PropTypes.object,
    clientes: PropTypes.object,
  })
};

export default UnitCountOne;
