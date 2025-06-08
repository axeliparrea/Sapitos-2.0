import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';
import './RiskProductsOne.css';

const riesgoConfig = {
  CRITICO: { label: "CRÍTICO", icon: "mdi:alert-circle", colorClass: "risk-critical" },
  ALTO: { label: "ALTO", icon: "mdi:alert", colorClass: "risk-high" },
  MEDIO: { label: "MEDIO", icon: "mdi:information", colorClass: "risk-medium" },
};

const RiskProductCard = ({ product }) => {
  const config = riesgoConfig[product.riesgo];
  const stockPercentage = Math.round(product.stockPercentage);

  return (
    <div className={`risk-card ${config.colorClass}`}>
      <div className="risk-card-header">
        <span className="risk-label">{config.label}</span>
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

const RiskProductsOne = ({ inventoryData, loading, error }) => {

  const getRiskProducts = () => {
    if (!inventoryData) return [];
    
    return inventoryData
      .map(p => {
        const stockPercentage = p.STOCKRECOMENDADO > 0 ? (p.STOCKACTUAL / p.STOCKRECOMENDADO) * 100 : 0;
        let riesgo = null;

        if (p.STOCKACTUAL <= p.STOCKMINIMO) {
          riesgo = "CRITICO";
        } else if (stockPercentage <= 75) {
          riesgo = "ALTO";
        } else if (stockPercentage <= 100) {
          riesgo = "MEDIO";
        }

        return { ...p, riesgo, stockPercentage };
      })
      .filter(p => p.riesgo)
      .sort((a, b) => {
        const order = { CRITICO: 1, ALTO: 2, MEDIO: 3 };
        return order[a.riesgo] - order[b.riesgo];
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