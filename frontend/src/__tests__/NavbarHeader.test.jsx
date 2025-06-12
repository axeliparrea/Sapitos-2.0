import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import NavbarHeader from '../components/roles/admin/navbarHeader';

/* eslint-env jest */
/* global describe, test, expect, global*/

// 🔹 Mock del componente hijo
vi.mock('../components/general/userMenu', () => ({
  __esModule: true,
  default: ({ name }) => <div data-testid="mock-user-menu">{name}</div>,
}));

// 🔹 Mock de getCookie
vi.mock('../utils/cookies', () => ({
  default: vi.fn(() => JSON.stringify({
    NOMBRE: 'Juan Pérez',
    ROL: 'Admin',
    CORREO: 'juan@example.com',
    LOCATION_ID: '123',
  })),
}));

// 🔹 Mock de fetch para ubicación
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ nombre: 'Oficina Central', organizacion: 'Fortacero' }),
  })
);

describe('NavbarHeader', () => {
  test('muestra texto de cargando mientras se obtiene el usuario', async () => {
    render(<NavbarHeader sidebarActive={false} sidebarControl={() => {}} mobileMenuControl={() => {}} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('mock-user-menu')).toBeInTheDocument();
    });
  });

  test('muestra nombre de ubicación y organización después de cargar', async () => {
    render(<NavbarHeader sidebarActive={false} sidebarControl={() => {}} mobileMenuControl={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Oficina Central')).toBeInTheDocument();
      expect(screen.getByText('(Fortacero)')).toBeInTheDocument();
    });
  });
});
