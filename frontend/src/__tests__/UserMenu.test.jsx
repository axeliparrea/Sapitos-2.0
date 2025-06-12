import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import UserMenu from '../components/general/userMenu';
/* eslint-env jest */
/* global describe, test, expect*/

describe('UserMenu', () => {
  test('se renderiza correctamente con props por defecto', () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );

    // Verifica nombre e imagen
    expect(screen.getByAltText('image_user')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Invitado')).toBeInTheDocument();
  });

  test('llama a onClose cuando se hace click en el botón de cerrar', () => {
    const onCloseMock = vi.fn();

    render(
      <MemoryRouter>
        <UserMenu onClose={onCloseMock} />
      </MemoryRouter>
    );

    const tacheBtn = screen.getByRole('button', { name: '' }); // ícono no tiene texto accesible
    fireEvent.click(tacheBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
