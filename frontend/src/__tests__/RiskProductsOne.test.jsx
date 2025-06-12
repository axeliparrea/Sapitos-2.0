import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskProductsOne from '../components/general/child/RiskProductsOne';

/* eslint-env jest */
/* global describe, test, expect*/
describe('RiskProductsOne', () => {
  test('muestra estado de cargando', () => {
    render(<RiskProductsOne loading={true} />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  test('muestra mensaje de error si hay error', () => {
    render(<RiskProductsOne error="Error al cargar" />);
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument();

  });

  test('muestra mensaje si no hay productos en riesgo', () => {
    render(<RiskProductsOne inventoryData={[]} loading={false} error={null} />);
    expect(screen.getByText(/no hay productos en riesgo/i)).toBeInTheDocument();
  });

  test('muestra productos en riesgo si existen', () => {
    const sampleData = [
      { nombre: 'Producto 1', categoria: 'A', stockActual: 2, stockRecomendado: 10, inventarioId: 1 },
      { nombre: 'Producto 2', categoria: 'B', stockActual: 5, stockRecomendado: 10, inventarioId: 2 },
      { nombre: 'Producto 3', categoria: 'C', stockActual: 7, stockRecomendado: 10, inventarioId: 3 },
    ];

    render(<RiskProductsOne inventoryData={sampleData} loading={false} error={null} />);

    expect(screen.getAllByText(/stock:/i)).toHaveLength(3);
    expect(screen.getByText(/producto 1/i)).toBeInTheDocument();
  });
});
