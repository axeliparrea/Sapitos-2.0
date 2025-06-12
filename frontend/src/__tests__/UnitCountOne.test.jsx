import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnitCountOne from '../components/general/child/UnitCountOne';
/* eslint-env jest */
/* global describe, test, expect*/

describe('UnitCountOne', () => {
  test('renderiza todos los KPI correctamente con datos', () => {
    const mockData = {
      ventas: { total: 12345.67, percentage_change: 5.5 },
      unidades: { total: 200, percentage_change: -3.2 },
      articulos: { total: 15, percentage_change: 1.1 },
      clientes: { total: 8, percentage_change: 0 },
    };

    render(<UnitCountOne kpiData={mockData} />);
    expect(screen.getByText('$12,345.67')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('muestra ceros si no se proporciona kpiData', () => {
    render(<UnitCountOne />);

    expect(screen.getByText('$0.00')).toBeInTheDocument(); // Ventas
    expect(screen.getAllByText('0')).toHaveLength(3);      // Unidades, Artículos, Clientes
  });
});
