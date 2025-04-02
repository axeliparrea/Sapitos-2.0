import { Icon } from "@iconify/react/dist/iconify.js";
import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../../hook/useReactApexChart";

const SalesStatisticOne = () => {
  let { chartOptions, chartSeries } = useReactApexChart();
  return (
    <div className='col-xxl-6 col-xl-12'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex flex-wrap align-items-center justify-content-between'>
            <h6 className='text-lg mb-0'>Estadistica de Ventas</h6>
            <select
              className='form-select bg-base form-select-sm w-auto'
              defaultValue='Yearly'
            >
              <option value='Yearly'>Anual</option>
              <option value='Monthly'>Mensual</option>
              <option value='Weekly'>Semanal</option>
              <option value='Today'>Diaria</option>
            </select>
          </div>
          <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
            <h6 className='mb-0'>$27,200</h6>
            <span className='text-sm fw-semibold rounded-pill bg-success-focus text-success-main border br-success px-8 py-4 line-height-1 d-flex align-items-center gap-1'>
              10% <Icon icon='bxs:up-arrow' className='text-xs' />
            </span>
            <span className='text-xs fw-medium'>+ $1500 Por Dia</span>
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
