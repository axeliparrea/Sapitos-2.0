import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SalesStatisticOne from '../components/general/child/SalesStatisticOne';
/* eslint-env jest */
/* global describe, test, expect, global*/
// Mock de ApexCharts
vi.mock('react-apexcharts', () => ({
  default: () => <div data-testid="mock-chart" />,
}));

// Mock de getCookie
vi.mock('../../../utils/cookies', () => ({
  default: vi.fn(() => JSON.stringify({ locationId: '123' })),
}));

// Mock de fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { ANIO: 2023, UNIDADES_VENDIDAS: 100 },
        { ANIO: 2024, UNIDADES_VENDIDAS: 120 },
      ]),
  })
);

describe('SalesStatisticOne', () => {
  test('renderiza el título correctamente', async () => {
    render(<SalesStatisticOne />);
    expect(screen.getByText(/Unidades Vendidas/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });

  test('renderiza el filtro select y opciones', () => {
    render(<SalesStatisticOne />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('yearly');
  });
});
