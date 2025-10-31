import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Experiences from '../components/Experiences';

describe('Experiences', () => {
  it('renderiza el título Actualizar Experiencia', () => {
  render(<Experiences onAgregar={() => {}} />);
    expect(screen.getByText('Actualizar Experiencia')).toBeInTheDocument();
  });
});
