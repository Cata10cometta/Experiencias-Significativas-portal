import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartSection from '../components/ChartSection';

describe('ChartSection', () => {
  it('renderiza el título Gráfico de Ejemplo', () => {
    render(<ChartSection />);
    expect(screen.getByText('Gráfico de Ejemplo')).toBeInTheDocument();
  });
});
