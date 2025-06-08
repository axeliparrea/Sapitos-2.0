import React, { useState, useEffect, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

const SalesStatisticOne = ({ ventasKpi }) => {
  const chartContainerRef = useRef(null);
  const [filter, setFilter] = useState('yearly');
  const [graphData, setGraphData] = useState([]);
  
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [chartWidth, setChartWidth] = useState('100%');

  const [stats, setStats] = useState({ total: 0, percentageChange: 0, periodLabel: '' });

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/kpi/unidades-vendidas-graph?filter=${filter}`);
        const data = await res.json();
        setGraphData(data);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };
    fetchGraphData();
  }, [filter]);

  useEffect(() => {
    if (graphData.length > 0) {
      processChartData(graphData, ventasKpi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData, ventasKpi, filter]);

  const processChartData = (graph, kpi) => {
    let seriesData, newOptions;
    const baseOptions = {
      chart: {
        id: 'sales-statistic-chart',
        toolbar: { show: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      colors: ['#5c61f2'],
      tooltip: {
        y: { formatter: val => `${val} unidades` },
      },
    };

    if (filter === 'yearly') {
      seriesData = [{
        name: 'Unidades Vendidas',
        data: graph.map(item => item.UNIDADES_VENDIDAS)
      }];
      newOptions = {
        ...baseOptions,
        xaxis: {
          type: 'category',
          categories: graph.map(item => item.ANIO.toString()),
          labels: { show: true }
        },
      };
      setChartWidth('100%');
    } else { // monthly
      seriesData = [{
        name: 'Unidades Vendidas',
        data: graph.map(item => [new Date(item.ANIO, item.MES - 1).getTime(), item.UNIDADES_VENDIDAS])
      }];
      newOptions = {
        ...baseOptions,
        xaxis: {
          type: 'datetime',
          labels: { 
            show: false,
            datetimeUTC: false 
          }
        },
        tooltip: {
            ...baseOptions.tooltip,
            x: { format: 'MMM yyyy' }
        }
      };
      setChartWidth(Math.max(500, graph.length * 50) + 'px');
    }
    
    const total = kpi?.total || 0;
    
    const dataForCalc = graph.map(item => item.UNIDADES_VENDIDAS);
    let percentageChange = 0;
    if (dataForCalc.length >= 2) {
        const currentPeriodValue = dataForCalc[dataForCalc.length - 1];
        const previousPeriodValue = dataForCalc[dataForCalc.length - 2];
        if (previousPeriodValue > 0) {
            percentageChange = ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) * 100;
        } else if (currentPeriodValue > 0) {
            percentageChange = 100;
        }
    }
    
    setChartOptions(newOptions);
    setChartSeries(seriesData);
    setStats({
      total,
      percentageChange,
      periodLabel: `desde el ${filter === 'monthly' ? 'mes' : 'año'} pasado`
    });
  };

  const scroll = (direction) => {
    if (chartContainerRef.current) {
      chartContainerRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };

  return (
    <div className='col-xxl-6 col-xl-6'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex flex-wrap align-items-center justify-content-between'>
            <h6 className='text-lg mb-0'>Unidades Vendidas</h6>
            <select
              className='form-select bg-base form-select-sm w-auto'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value='yearly'>Anual</option>
              <option value='monthly'>Mensual</option>
            </select>
          </div>

          <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
            <h6 className='mb-0'>${stats.total.toLocaleString()}</h6>
            <span className={`text-sm fw-semibold rounded-pill ${stats.percentageChange >= 0 ? 'bg-success-focus text-success-main border br-success' : 'bg-danger-focus text-danger-main border br-danger'} px-8 py-4 line-height-1 d-flex align-items-center gap-1`}>
              {stats.percentageChange >= 0 ? '+' : ''}{stats.percentageChange.toFixed(1)}% 
              <Icon icon={stats.percentageChange >= 0 ? 'bxs:up-arrow' : 'bxs:down-arrow'} className='text-xs' />
            </span>
            <span className='text-xs fw-medium'>↑ {stats.periodLabel}</span>
          </div>
          
          <div className='position-relative'>
            <div ref={chartContainerRef} className={filter === 'monthly' ? 'overflow-x-auto' : ''} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .overflow-x-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {chartSeries.length > 0 && (
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type='area'
                  height={264}
                  width={chartWidth}
                />
              )}
            </div>
            {filter === 'monthly' && (
              <>
                <div 
                  onClick={() => scroll(-1)} 
                  className='position-absolute top-0 start-0 h-100'
                  style={{ width: '15%', zIndex: 10, cursor: 'w-resize' }}
                ></div>
                <div 
                  onClick={() => scroll(1)} 
                  className='position-absolute top-0 end-0 h-100'
                  style={{ width: '15%', zIndex: 10, cursor: 'e-resize' }}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SalesStatisticOne.propTypes = {
  ventasKpi: PropTypes.object,
};

export default SalesStatisticOne;
