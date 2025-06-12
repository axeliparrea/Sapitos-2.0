import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Sidebar from '../components/roles//admin/sidebar';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

/* eslint-env jest */
/* global describe, test, expect*/

describe('Sidebar', () => {
  const renderSidebar = (props) =>
    render(
      <BrowserRouter>
        <Sidebar {...props} />
      </BrowserRouter>
    );

  test('renderiza correctamente con sidebarActive true', () => {
    const { container } = renderSidebar({
      sidebarActive: true,
      mobileMenu: false,
      mobileMenuControl: vi.fn(),
    });

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar.classList.contains('active')).toBe(true);
  });

  test('renderiza correctamente con mobileMenu true', () => {
    const { container } = renderSidebar({
      sidebarActive: false,
      mobileMenu: true,
      mobileMenuControl: vi.fn(),
    });

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar.classList.contains('sidebar-open')).toBe(true);
  });

  test('no tiene clases adicionales cuando sidebarActive y mobileMenu son false', () => {
    const { container } = renderSidebar({
      sidebarActive: false,
      mobileMenu: false,
      mobileMenuControl: vi.fn(),
    });

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar.className).toBe('sidebar');
  });

  test('renderiza los botones del menú correctamente', () => {
    renderSidebar({
      sidebarActive: false,
      mobileMenu: false,
      mobileMenuControl: vi.fn(),
    });

    expect(screen.getByRole('link', { name: /Estadisticas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inventario/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pedidos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ordenes Pymes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Artículos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ubicaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Modelo IA/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Notificaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Asistente IA/i })).toBeInTheDocument();
  });
});
