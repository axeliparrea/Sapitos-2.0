import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";

const GeneratedContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    paymentStatusChartSeries: [],
    paymentStatusChartOptions: {},
    metrics: {
      totalProductos: 0,  
      totalCategorias: 0 
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/ordenes'); 
        
        const { paymentStatusChartSeries, paymentStatusChartOptions, metrics } = response.data;

        const filteredMetrics = {
          totalProductos: metrics.totalProductos || 0,  
          totalCategorias: metrics.totalCategorias || 0 
        };

        setChartData({
          paymentStatusChartSeries,
          paymentStatusChartOptions,
          metrics: filteredMetrics
        });
        
        setError(null);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Error al cargar los datos de categorías");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  if (loading) return (
    <div className='col-xxl-6'>
      <div className='card h-100'>
        <div className='card-body d-flex justify-content-center align-items-center'>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className='col-xxl-6'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='col-xxl-6'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 id="tituloGrafico" className='mb-2 fw-bold text-lg mb-0'>Productos por Categoría</h6>
          </div>
          <ul className='d-flex flex-wrap align-items-center mt-3 gap-3'>
            <li className='d-flex align-items-center gap-2'>
              <span className='w-12-px h-12-px rounded-circle bg-primary-600' />
              <span className='text-secondary-light text-sm fw-semibold'>
                Productos Vendidos:
                <span className='text-primary-light fw-bold'>{chartData.metrics.totalProductos}</span>
              </span>
            </li>
            <li className='d-flex align-items-center gap-2'>
              <span className='w-12-px h-12-px rounded-circle bg-yellow' />
              <span className='text-secondary-light text-sm fw-semibold'>
                Categorías:
                <span id="totalCategorias" className='text-primary-light fw-bold'>{chartData.metrics.totalCategorias}</span>
              </span>
            </li>
          </ul>
          <div className='mt-40'>
            <div id="graficoCategorias" className='margin-16-minus'>
              <ReactApexChart
                options={chartData.paymentStatusChartOptions}
                series={chartData.paymentStatusChartSeries}
                type='bar'
                height={250}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedContent;
