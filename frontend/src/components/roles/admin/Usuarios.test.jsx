import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Usuarios from './Usuarios';
import axios from 'axios';

// Mock Axios
vi.mock('axios');

describe('Usuarios', () => {
  const mockUsers = [
    {
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      organizacion: 'Acme Corp',
      rol: 'admin',
      diasordenprom: 5,
      valorordenprom: 1200,
    },
    {
      nombre: 'Ana Gómez',
      correo: 'ana@example.com',
      organizacion: 'Globex',
      rol: 'cliente',
      diasordenprom: 3,
      valorordenprom: 800,
    }
  ];

  it('muestra el mensaje de carga al inicio', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });
    render(<Usuarios />);
    expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument();
  });

  it('renderiza los usuarios después de la carga', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    render(<Usuarios />);

    await waitFor(() => {
      expect(screen.getByText(/juan pérez/i)).toBeInTheDocument();
      expect(screen.getByText(/ana gómez/i)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /editar/i }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: /eliminar/i }).length).toBe(2);
  });

  it('muestra mensaje de error si axios falla', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<Usuarios />);

    await waitFor(() => {
      expect(screen.getByText(/error al obtener usuarios/i)).toBeInTheDocument();
    });
  });

  it('filtra usuarios por búsqueda', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    render(<Usuarios />);

    await waitFor(() => {
      expect(screen.getByText(/juan pérez/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/buscar usuarios/i);
    fireEvent.change(input, { target: { value: 'Ana' } });

    expect(screen.queryByText(/juan pérez/i)).not.toBeInTheDocument();
    expect(screen.getByText(/ana gómez/i)).toBeInTheDocument();
  });
});
