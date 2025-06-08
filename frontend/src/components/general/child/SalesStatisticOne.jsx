import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

const SalesStatisticOne = ({ kpiData, graphData }) => {
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [stats, setStats] = useState({ total: 0, percentageChange: 0, periodLabel: '' });

  useEffect(() => {
    if (graphData && kpiData) {
      processChartData(graphData, kpiData);
    }
  }, [graphData, kpiData]);

  const processChartData = (graph, kpi) => {
    const labels = graph.map(item => `${item.ANIO}-${String(item.MES).padStart(2, '0')}`);
    const data = graph.map(item => item.UNIDADES_VENDIDAS);
    
    const total = kpi.reduce((acc, item) => acc + parseFloat(item.VENTAS_TOTALES), 0);

    // Placeholder for percentage change logic
    const percentageChange = 8; // Example static value
    
    setChartData({ labels, data });
    setStats({
      total,
      percentageChange,
      periodLabel: `desde el mes pasado`
    });
  };

  const chartOptions = {
    chart: {
      id: 'sales-statistic-chart',
      toolbar: { show: false },
    },
    xaxis: {
      categories: chartData.labels,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    colors: ['#5c61f2'],
    tooltip: {
      y: {
        formatter: val => `${val} unidades`,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Unidades Vendidas',
      data: chartData.data,
    },
  ];

  return (
    <div className='col-xxl-6 col-xl-6'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex flex-wrap align-items-center justify-content-between'>
            <h6 className='text-lg mb-0'>Unidades Vendidas</h6>
          </div>

          <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
            <h6 className='mb-0'>${stats.total.toLocaleString()}</h6>
            <span className={`text-sm fw-semibold rounded-pill ${stats.percentageChange >= 0 ? 'bg-success-focus text-success-main border br-success' : 'bg-danger-focus text-danger-main border br-danger'} px-8 py-4 line-height-1 d-flex align-items-center gap-1`}>
              {stats.percentageChange >= 0 ? '+' : ''}{stats.percentageChange.toFixed(1)}% 
              <Icon icon={stats.percentageChange >= 0 ? 'bxs:up-arrow' : 'bxs:down-arrow'} className='text-xs' />
            </span>
            <span className='text-xs fw-medium'>↑ {stats.periodLabel}</span>
          </div>

          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type='area'
            height={264}
          />
        </div>
      </div>
    </div>
  );
};

SalesStatisticOne.propTypes = {
  kpiData: PropTypes.array,
  graphData: PropTypes.array,
};

export default SalesStatisticOne;
