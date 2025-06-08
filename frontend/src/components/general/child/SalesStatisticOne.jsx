import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import { format, sub, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval } from 'date-fns';

const SalesStatisticOne = ({ inventoryData }) => {
  const [filter, setFilter] = useState('Monthly');
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [stats, setStats] = useState({ total: 0, percentageChange: 0, periodLabel: '' });

  useEffect(() => {
    if (inventoryData) {
      processChartData(filter);
    }
  }, [inventoryData, filter]);

  const processChartData = (currentFilter) => {
    const now = new Date();
    let startDate, endDate, intervalFunction, subFunction, periodLabelFormat;

    switch (currentFilter) {
      case 'Today':
        startDate = now;
        endDate = now;
        intervalFunction = eachDayOfInterval;
        subFunction = (date, num) => sub(date, { days: num });
        periodLabelFormat = 'HH:mm';
        break;
      case 'Weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        intervalFunction = eachDayOfInterval;
        subFunction = (date, num) => sub(date, { weeks: num });
        periodLabelFormat = 'E';
        break;
      case 'Yearly':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        intervalFunction = eachMonthOfInterval;
        subFunction = (date, num) => sub(date, { years: num });
        periodLabelFormat = 'MMM';
        break;
      default: // Monthly
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        intervalFunction = eachDayOfInterval;
        subFunction = (date, num) => sub(date, { months: num });
        periodLabelFormat = 'dd';
        break;
    }

    const labels = intervalFunction({ start: startDate, end: endDate }).map(date => format(date, periodLabelFormat));
    const data = Array(labels.length).fill(0);
    let total = 0;

    inventoryData.forEach(item => {
      if (item.FECHAULTIMAEXPORTACION) {
        const itemDate = new Date(item.FECHAULTIMAEXPORTACION);
        if (itemDate >= startDate && itemDate <= endDate) {
          const labelIndex = labels.indexOf(format(itemDate, periodLabelFormat));
          if (labelIndex !== -1) {
            data[labelIndex] += item.EXPORTACION || 0;
            total += item.EXPORTACION || 0;
          }
        }
      }
    });

    const prevStartDate = subFunction(startDate, 1);
    const prevEndDate = subFunction(endDate, 1);
    let prevTotal = 0;

    inventoryData.forEach(item => {
      if (item.FECHAULTIMAEXPORTACION) {
        const itemDate = new Date(item.FECHAULTIMAEXPORTACION);
        if (itemDate >= prevStartDate && itemDate <= prevEndDate) {
          prevTotal += item.EXPORTACION || 0;
        }
      }
    });

    const percentageChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : total > 0 ? 100 : 0;
    
    setChartData({ labels, data });
    setStats({
      total,
      percentageChange,
      periodLabel: `desde el ${currentFilter === 'Monthly' ? 'mes' : currentFilter === 'Weekly' ? 'semana' : 'día'} pasado`
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
            <h6 className='text-lg mb-0'>Total de Unidades Vendidas por Mes</h6>
            <select
              className='form-select bg-base form-select-sm w-auto'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value='Yearly'>Anual</option>
              <option value='Monthly'>Mensual</option>
              <option value='Weekly'>Semanal</option>
              <option value='Today'>Diaria</option>
            </select>
          </div>

          <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
            <h6 className='mb-0'>{stats.total.toLocaleString()} Unidades</h6>
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
  inventoryData: PropTypes.array
};

export default SalesStatisticOne;
