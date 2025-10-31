import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../components/Sidebar';

// Mock localStorage y fetchMenu
beforeEach(() => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('token', 'fake-token');
});

vi.mock('../Api/Services/menuService', () => {
  return {
    fetchMenu: vi.fn(() => Promise.resolve([
      { formId: 1, form: 'Modules', path: '/modules', icon: '', order: 1, moduleId: 1, module: 'Módulo 1' },
      { formId: 2, form: 'Customers', path: '/customers', icon: '', order: 2, moduleId: 1, module: 'Módulo 1' },
    ])),
  };
});

describe('Sidebar', () => {
  it('renderiza el botón hamburguesa', () => {
    render(<Sidebar setActiveContent={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('muestra el menú al hacer click en el botón', async () => {
    render(<Sidebar setActiveContent={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('Modules')).toBeInTheDocument();
    expect(await screen.findByText('Customers')).toBeInTheDocument();
  });
});
