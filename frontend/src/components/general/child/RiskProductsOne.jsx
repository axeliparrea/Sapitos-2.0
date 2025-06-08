import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';
import './RiskProductsOne.css';

const riesgoConfig = {
  PELIGRO: { label: "Peligro", icon: "mdi:alert-circle", colorClass: "risk-danger" },
  RIESGO: { label: "Riesgo", icon: "mdi:alert", colorClass: "risk-warning" },
  CUMPLIRA: { label: "Cumplirá", icon: "mdi:check-circle", colorClass: "risk-success" },
};

const RiskProductCard = ({ product }) => {
  const config = riesgoConfig[product.riesgo];
  const stockPercentage = Math.round(product.stockPercentage);

  return (
    <div className={`risk-card ${config.colorClass}`}>
      <div className="risk-card-header">
        <span className="risk-status-label">{config.label}</span>
        <Icon icon={config.icon} className="risk-icon" />
      </div>
      <div className="risk-card-body">
        <h6 className="product-name" title={product.NOMBRE}>{product.NOMBRE}</h6>
        <p className="product-category">{product.CATEGORIA}</p>
        <div className="stock-info">
          <span>Stock:</span>
          <span className="stock-values">{product.STOCKACTUAL}/{product.STOCKRECOMENDADO}</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${stockPercentage}%` }}></div>
        </div>
        <div className="stock-percentage">
          {stockPercentage}%
        </div>
      </div>
    </div>
  );
};

RiskProductCard.propTypes = {
  product: PropTypes.object.isRequired,
};

const RiskProductsOne = ({ inventoryData, loading, error }) => {  const getRiskProducts = () => {
    if (!inventoryData) return [];
    
    return inventoryData
      .map(p => {
        const stockPercentage = p.STOCKRECOMENDADO > 0 ? (p.STOCKACTUAL / p.STOCKRECOMENDADO) * 100 : 0;
        let riesgo = null;

        // Nueva clasificación basada en porcentaje - solo productos que necesitan atención
        if (stockPercentage < 50) {
          riesgo = "PELIGRO";
        } else if (stockPercentage >= 50 && stockPercentage < 75) {
          riesgo = "RIESGO";
        } else if (stockPercentage >= 75 && stockPercentage < 100) {
          riesgo = "CUMPLIRA";
        }
        // No incluir productos con 100% o más (ya están bien abastecidos)

        return { ...p, riesgo, stockPercentage };
      })
      .filter(p => p.riesgo) // Solo productos con algún nivel de riesgo o cerca de cumplir
      .sort((a, b) => {
        // Ordenar del menos posible a cumplir (menor porcentaje) al más posible (mayor porcentaje)
        return a.stockPercentage - b.stockPercentage;
      })
      .slice(0, 3);
  };

  const productosEnRiesgo = getRiskProducts();

  return (
    <div className="col-xxl-6 col-xl-6">
      <div className="card h-100 radius-8 border-0 shadow-sm">
        <div className="card-body p-24 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h6 className="fw-semibold text-lg mb-0">Productos en Riesgo</h6>
              <p className="text-muted mb-0">Monitoreo de stock crítico</p>
            </div>
            <div className="d-flex align-items-center">
                <span className="total-risk-count me-2">{productosEnRiesgo.length}</span>
                <span className="total-risk-label">Total</span>
                <Icon icon="mdi:alert-circle-outline" className="total-risk-icon ms-2" />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <Icon icon="mdi:loading" className="text-lg animate-spin me-2" />
              Cargando...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : productosEnRiesgo.length === 0 ? (
            <div className="text-center text-muted py-4">No hay productos en riesgo</div>
          ) : (
            <div className="d-flex justify-content-center gap-3 flex-grow-1">
              {productosEnRiesgo.map((prod) => (
                <RiskProductCard key={prod.INVENTARIO_ID} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RiskProductsOne.propTypes = {
  inventoryData: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default RiskProductsOne; 