import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // 👈 esto habilita toBeInTheDocument
import AddUserLayer from './AddUserLayer';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AddUserLayer', () => {
  it('renderiza campos del formulario', () => {
    render(
      <BrowserRouter>
        <AddUserLayer />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('permite escribir en el campo de nombre', () => {
    render(
      <BrowserRouter>
        <AddUserLayer />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/nombre completo/i);
    fireEvent.change(input, { target: { value: 'Pedro' } });
    expect(input.value).toBe('Pedro');
  });
});
