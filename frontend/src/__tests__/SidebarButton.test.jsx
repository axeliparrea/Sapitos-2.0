import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom'; // <- Importar los matchers aquí
import SidebarButton from '../components/general/sideBarButton';
/* eslint-env jest */
/* global describe, test, expect*/

describe('SidebarButton', () => {
  test('se renderiza correctamente con props mínimas', () => {
    render(
      <MemoryRouter>
        <SidebarButton to="/dashboard" icon="mdi:home" label="Inicio" />
      </MemoryRouter>
    );

    const button = screen.getByRole('link', { name: /inicio/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'sidebarButton-inicio');
  });
});
