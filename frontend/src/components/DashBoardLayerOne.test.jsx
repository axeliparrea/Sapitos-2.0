import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashBoardLayerOne from './DashBoardLayerOne';

// Mocks de componentes hijos
vi.mock('./general/child/SalesStatisticOne', () => ({
  default: () => <div data-testid="sales-statistic">SalesStatisticOne</div>,
}));

vi.mock('./general/child/TotalSubscriberOne', () => ({
  default: () => <div data-testid="total-subscriber">TotalSubscriberOne</div>,
}));

vi.mock('./general/child/UnitCountOne', () => ({
  default: () => <div data-testid="unit-count">UnitCountOne</div>,
}));

describe('DashBoardLayerOne', () => {
  it('renderiza todos los componentes hijos', () => {
    render(<DashBoardLayerOne />);

    expect(screen.getByTestId('sales-statistic')).toBeInTheDocument();
    expect(screen.getByTestId('total-subscriber')).toBeInTheDocument();
    expect(screen.getByTestId('unit-count')).toBeInTheDocument();
  });
});
