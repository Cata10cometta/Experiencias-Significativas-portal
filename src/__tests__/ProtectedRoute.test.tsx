import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../Api/Services/Auth', () => ({ getToken: () => null }));

describe('ProtectedRoute', () => {
  it('redirige si no hay token', () => {
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(container.innerHTML).not.toContain('Contenido protegido');
  });
});
