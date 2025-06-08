import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';

const riesgoColors = {
  CRITICO: "bg-danger text-white border-danger",
  ALTO: "bg-warning text-dark border-warning",
  MEDIO: "bg-primary-light text-primary border-primary"
};

const riesgoLabels = {
  CRITICO: "CRÍTICO",
  ALTO: "ALTO",
  MEDIO: "MEDIO"
};

const RiskProductsOne = ({ inventoryData, loading, error }) => {

  const getRiskProducts = () => {
    if (!inventoryData) return [];
    
    return inventoryData
      .map(p => {
        const stockPercentage = (p.STOCKACTUAL / p.STOCKRECOMENDADO) * 100;
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
      });
  };

  const productosEnRiesgo = getRiskProducts();

  return (
    <div className="col-xxl-6 col-xl-6">
      <div className="card h-100 radius-8 border">
        <div className="card-body p-24">
          <div className="d-flex align-items-center justify-content-between mb-12">
            <h6 className="fw-semibold text-lg mb-0">Riesgo</h6>
            <span className="fs-3 fw-bold text-danger d-flex align-items-center gap-1">
              <Icon icon="mdi:alert" className="me-1" />
              {productosEnRiesgo.length}
            </span>
          </div>
          <p className="text-muted mb-16">Stock crítico</p>
          {loading ? (
            <div className="text-center py-4">
              <Icon icon="mdi:loading" className="text-lg animate-spin me-2" />
              Cargando productos en riesgo...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : productosEnRiesgo.length === 0 ? (
            <div className="text-center text-muted py-4">No hay productos en riesgo</div>
          ) : (
            <div className="d-flex flex-wrap gap-3">
              {productosEnRiesgo.map((prod) => (
                <div
                  key={prod.INVENTARIO_ID}
                  className={`border radius-8 p-16 position-relative shadow-sm ${riesgoColors[prod.riesgo]}`}
                  style={{ minWidth: 180, maxWidth: 220, flex: "1 1 180px" }}
                >
                  <span className="badge position-absolute top-0 end-0 mt-2 me-2 fw-bold" style={{ zIndex: 2 }}>
                    {riesgoLabels[prod.riesgo]}
                  </span>
                  <div className="fw-semibold fs-6 mb-1 text-truncate" title={prod.NOMBRE}>{prod.NOMBRE}</div>
                  <div className="text-muted text-xs mb-2">{prod.CATEGORIA}</div>
                  <div className="mb-2">
                    <span className="fw-bold">Stock:</span> {prod.STOCKACTUAL} / {prod.STOCKRECOMENDADO}
                  </div>
                  <div className="fw-bold fs-5 mb-0">
                    {Math.round(prod.stockPercentage)}%
                  </div>
                </div>
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