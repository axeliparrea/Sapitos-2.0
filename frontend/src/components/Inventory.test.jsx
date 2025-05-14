import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Inventory from './Inventory';
import axios from 'axios';

// Mock de axios
vi.mock('axios');

describe('Inventory', () => {
  it('muestra el mensaje de carga mientras se obtiene el inventario', () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<Inventory />);
    expect(screen.getByText(/cargando inventario/i)).toBeInTheDocument();
  });

  it('muestra datos del inventario cuando la petición es exitosa', async () => {
    const mockData = [
      {
        id: 1,
        nombre: 'Producto 1',
        proveedor: 'Proveedor A',
        categoria: 'Categoría X',
        stockActual: 10,
        stockMinimo: 5,
        precioCompra: 12.5,
        precioVenta: 20,
        fechaUltimaCompra: '2024-01-10',
        fechaUltimaVenta: '2024-03-15',
      },
    ];

    axios.get.mockResolvedValue({ data: mockData });

    render(<Inventory />);

    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Proveedor A')).toBeInTheDocument();
      expect(screen.getByText('Categoría X')).toBeInTheDocument();
    });
  });

  it('muestra un error si la petición falla', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<Inventory />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar el inventario/i)).toBeInTheDocument();
    });
  });
});
