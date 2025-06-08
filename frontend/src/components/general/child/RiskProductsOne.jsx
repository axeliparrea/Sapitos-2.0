import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

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

const RiskProductsOne = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/inventory/risk-products", { withCredentials: true });
        setProductos(response.data || []);
      } catch (err) {
        setError("No se pudieron cargar los productos en riesgo");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  return (
    <div className="col-xxl-6 col-xl-6">
      <div className="card h-100 radius-8 border">
        <div className="card-body p-24">
          <div className="d-flex align-items-center justify-content-between mb-12">
            <h6 className="fw-semibold text-lg mb-0">Productos en Riesgo</h6>
            <span className="fs-3 fw-bold text-danger d-flex align-items-center gap-1">
              <Icon icon="mdi:alert" className="me-1" />
              {productos.length}
            </span>
          </div>
          <p className="text-muted mb-16">Monitoreo de stock crítico</p>
          {loading ? (
            <div className="text-center py-4">
              <Icon icon="mdi:loading" className="text-lg animate-spin me-2" />
              Cargando productos en riesgo...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : productos.length === 0 ? (
            <div className="text-center text-muted py-4">No hay productos en riesgo</div>
          ) : (
            <div className="d-flex flex-wrap gap-3">
              {productos.map((prod, idx) => (
                <div
                  key={prod.inventarioId}
                  className={`border radius-8 p-16 position-relative shadow-sm ${riesgoColors[prod.riesgo]}`}
                  style={{ minWidth: 180, maxWidth: 220, flex: "1 1 180px" }}
                >
                  <span className="badge position-absolute top-0 end-0 mt-2 me-2 fw-bold" style={{ zIndex: 2 }}>
                    {riesgoLabels[prod.riesgo]}
                  </span>
                  <div className="fw-semibold fs-6 mb-1 text-truncate" title={prod.nombre}>{prod.nombre}</div>
                  <div className="text-muted text-xs mb-2">{prod.categoria}</div>
                  <div className="mb-2">
                    <span className="fw-bold">Stock:</span> {prod.stockActual} / {prod.stockMinimo}
                  </div>
                  <div className="fw-bold fs-5 mb-0" style={{ color: prod.riesgo === "CRITICO" ? "#dc3545" : prod.riesgo === "ALTO" ? "#ffc107" : "#0d6efd" }}>
                    {prod.porcentaje}%
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

export default RiskProductsOne; 