import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const InvoiceListLayer = () => {
  return (
    <div className='card'>
      <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <div className='d-flex align-items-center gap-2'>
            <span>Pedidos</span>
            <select
              className='form-select form-select-sm w-auto'
              defaultValue='Select Number'
            >
              <option value='Select Number' disabled>
                Seleccionar
              </option>
              <option value='10'>10</option>
              <option value='15'>15</option>
              <option value='20'>20</option>
            </select>
          </div>
          <div className='icon-field'>
            <input
              type='text'
              name='#0'
              className='form-control form-control-sm w-auto'
              placeholder='Buscar'
            />
            <span className='icon'>
              <Icon icon='ion:search-outline' />
            </span>
          </div>
        </div>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <select
            className='form-select form-select-sm w-auto'
            defaultValue='Select Status'
          >
            <option value='Select Status' disabled>
              Filtrar
            </option>
            <option value='Paid'>Completado</option>
            <option value='Pending'>En Reparto</option>
          </select>
          <Link to='/invoice-add' className='btn btn-sm btn-primary-600'>
            <i className='ri-add-line' /> Crear Pedido
          </Link>
        </div>
      </div>
      <div className='card-body'>
        <table className='table bordered-table mb-0'>
          <thead>
            <tr>
              <th scope='col'>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='checkAll'
                  />
                  <label className='form-check-label' htmlFor='checkAll'>
                    Número
                  </label>
                </div>
              </th>
              <th scope='col'>ID</th>
              <th scope='col'>Proveedor</th>
              <th scope='col'>Fecha</th>
              <th scope='col'>Cantidad</th>
              <th scope='col'>Estatus</th>
              <th scope='col'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check1'
                  />
                  <label className='form-check-label' htmlFor='check1'>
                    01
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #526534
                </Link>
              </td>
              <td>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    GUCCI
                  </h6>
              </td>
              <td>25 Ene 2024</td>
              <td>200</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check2'
                  />
                  <label className='form-check-label' htmlFor='check2'>
                    02
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #696589
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    Bershka
                  </h6>
                </div>
              </td>
              <td>25 Ene 2024</td>
              <td>200</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check3'
                  />
                  <label className='form-check-label' htmlFor='check3'>
                    03
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #256584
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    Tommy
                  </h6>
                </div>
              </td>
              <td>10 Feb 2024</td>
              <td>100</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check4'
                  />
                  <label className='form-check-label' htmlFor='check4'>
                    04
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #526587
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    ZARA
                  </h6>
                </div>
              </td>
              <td>10 Feb 2024</td>
              <td>300</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check5'
                  />
                  <label className='form-check-label' htmlFor='check5'>
                    05
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #105986
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    GUCCI
                  </h6>
                </div>
              </td>
              <td>15 Mar 2024</td>
              <td>250</td>
              <td>
                {" "}
                <span className='bg-warning-focus text-warning-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Pendiente
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check6'
                  />
                  <label className='form-check-label' htmlFor='check6'>
                    06
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #526589
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    GUCCI
                  </h6>
                </div>
              </td>
              <td>15 Mar 2024</td>
              <td>248</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  En Reparto
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check7'
                  />
                  <label className='form-check-label' htmlFor='check7'>
                    07
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #526520
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    ZARA
                  </h6>
                </div>
              </td>
              <td>27 Abr 2024</td>
              <td>400</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check8'
                  />
                  <label className='form-check-label' htmlFor='check8'>
                    08
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #256584
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    Tommy
                  </h6>
                </div>
              </td>
              <td>27 Abr 2024</td>
              <td>600</td>
              <td>
                {" "}
                <span className='bg-warning-focus text-warning-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Pendiente
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check9'
                  />
                  <label className='form-check-label' htmlFor='check9'>
                    09
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #200257
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    Michael Kors
                  </h6>
                </div>
              </td>
              <td>30 Abr 2024</td>
              <td>200</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    defaultValue=''
                    id='check110'
                  />
                  <label className='form-check-label' htmlFor='check110'>
                    10
                  </label>
                </div>
              </td>
              <td>
                <Link to='#' className='text-primary-600'>
                  #526525
                </Link>
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <h6 className='text-md mb-0 fw-medium flex-grow-1'>
                    Tommy
                  </h6>
                </div>
              </td>
              <td>30 Abr 2024</td>
              <td>500</td>
              <td>
                {" "}
                <span className='bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm'>
                  Completado
                </span>
              </td>
              <td>
                <Link
                  to='/invoice-preview'
                  className='w-32-px h-32-px  me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='iconamoon:eye-light' />
                </Link>
                <Link
                  to='/invoice-edit'
                  className='w-32-px h-32-px  me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='lucide:edit' />
                </Link>
                <Link
                  to='#'
                  className='w-32-px h-32-px  me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                >
                  <Icon icon='mingcute:delete-2-line' />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24'>
          <span>Mostrando 1 a 10 de 12 pedidos</span>
          <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
            <li className='page-item'>
              <Link
                className='page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px bg-base'
                to='#'
              >
                <Icon icon='ep:d-arrow-left' className='text-xl' />
              </Link>
            </li>
            <li className='page-item'>
              <Link
                className='page-link bg-primary-600 text-white fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px'
                to='#'
              >
                1
              </Link>
            </li>
            <li className='page-item'>
              <Link
                className='page-link bg-primary-50 text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px'
                to='#'
              >
                2
              </Link>
            </li>
            <li className='page-item'>
              <Link
                className='page-link bg-primary-50 text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px'
                to='#'
              >
                3
              </Link>
            </li>
            <li className='page-item'>
              <Link
                className='page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px bg-base'
                to='#'
              >
                {" "}
                <Icon icon='ep:d-arrow-right' className='text-xl' />{" "}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvoiceListLayer;
