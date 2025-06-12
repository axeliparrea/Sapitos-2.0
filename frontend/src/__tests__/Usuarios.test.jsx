import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Usuarios from '../components/roles/admin/Usuarios';
import '@testing-library/jest-dom';
import axios from 'axios';
import { vi } from 'vitest';
/* eslint-env jest */
/* global describe, test, expect,beforeEach,afterEach*/
vi.mock('axios');

describe('Usuarios', () => {
  const mockUsuarios = [
    {
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      organizacion: 'Org1',
      ROL_ID: 1,
    },
  ];

  const mockRoles = [
    {
      ROL_ID: 1,
      NOMBRE: 'admin',
    },
  ];

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/getUsers')) return Promise.resolve({ data: mockUsuarios });
      if (url.includes('/getRoles')) return Promise.resolve({ data: mockRoles });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('muestra usuarios después de cargar', async () => {
    render(<Usuarios />);

    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      expect(screen.getByText(/juan@example.com/i)).toBeInTheDocument();
    });
  });

  test('filtra usuarios por nombre', async () => {
    render(<Usuarios />);

    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Buscar usuarios/i), {
      target: { value: 'noexiste' },
    });

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron usuarios/i)).toBeInTheDocument();
    });
  });
});
