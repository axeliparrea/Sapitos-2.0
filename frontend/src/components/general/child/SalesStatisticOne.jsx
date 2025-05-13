import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { Icon } from '@iconify/react';

const SalesStatisticOne = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filter, setFilter] = useState('Yearly');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('/inventory'); 
        const data = Array.isArray(response.data) ? response.data : response.data.data;

        const filtered = data.map(item => ({
          fechaEntrega: item.fechaEntrega,
          total: Number(item.total),
          estatus: item.estatus,
          organizacion: item.organizacion,
        }));

        setInventoryData(filtered);
      } catch (error) {
        console.error('Error al cargar el inventario', error);
        setInventoryData([]);
      }
    };

    fetchInventory();
  }, []);

  const totalPorFecha = inventoryData.reduce((acc, item) => {
    acc[item.fechaEntrega] = (acc[item.fechaEntrega] || 0) + item.total;
    return acc;
  }, {});

  const fechas = Object.keys(totalPorFecha).sort();
  const totales = fechas.map(fecha => totalPorFecha[fecha]);

  const chartOptions = {
    chart: {
      id: 'inventory-chart',
      toolbar: { show: false },
    },
    xaxis: {
      categories: fechas,
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
        formatter: val => `$${val}`,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Total',
      data: totales,
    },
  ];

  const totalGeneral = totales.reduce((acc, val) => acc + val, 0);

  return (
    <div className='col-xxl-6 col-xl-12'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex flex-wrap align-items-center justify-content-between'>
            <h6 className='text-lg mb-0'>Estadística de Inventario</h6>
            <select
              className='form-select bg-base form-select-sm w-auto'
              defaultValue='Yearly'
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value='Yearly'>Anual</option>
              <option value='Monthly'>Mensual</option>
              <option value='Weekly'>Semanal</option>
              <option value='Today'>Diaria</option>
            </select>
          </div>

          <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
            <h6 className='mb-0'>${totalGeneral.toLocaleString()}</h6>
            <span className='text-sm fw-semibold rounded-pill bg-success-focus text-success-main border br-success px-8 py-4 line-height-1 d-flex align-items-center gap-1'>
              +10% <Icon icon='bxs:up-arrow' className='text-xs' />
            </span>
            <span className='text-xs fw-medium'>↑ desde el mes pasado</span>
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


export default SalesStatisticOne;
