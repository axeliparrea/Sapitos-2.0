import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddArticuloLayer from '../components/AddArticuloLayer';
import axios from 'axios';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
/* eslint-env jest */
/* global describe, test, expect*/

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AddArticuloLayer', () => {
  test('renderiza el formulario correctamente', () => {
    render(
      <MemoryRouter>
        <AddArticuloLayer />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio del proveedor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio de venta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temporada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
  });

  test('envía el formulario correctamente', async () => {
    axios.post.mockResolvedValueOnce({});
    render(
      <MemoryRouter>
        <AddArticuloLayer />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Articulo 1' } });
    fireEvent.change(screen.getByLabelText(/Categoría/i), { target: { value: 'Categoria 1' } });
    fireEvent.change(screen.getByLabelText(/Precio del proveedor/i), { target: { value: '10.00' } });
    fireEvent.change(screen.getByLabelText(/Precio de venta/i), { target: { value: '15.00' } });
    fireEvent.change(screen.getByLabelText(/Temporada/i), { target: { value: 'Primavera' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/articulo',
        {
          Nombre: 'Articulo 1',
          Categoria: 'Categoria 1',
          PrecioProveedor: '10.00',
          PrecioVenta: '15.00',
          Temporada: 'Primavera',
        },
        { withCredentials: true }
      );
    });
  });

  test('no envía si los campos están vacíos', () => {
    render(
      <MemoryRouter>
        <AddArticuloLayer />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
    expect(axios.post).not.toHaveBeenCalled();
  });
});
