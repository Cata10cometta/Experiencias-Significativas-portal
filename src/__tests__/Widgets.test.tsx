import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Widgets from '../components/Widgets';

describe('Widgets', () => {
  it('renderiza el título Ejes temáticos', () => {
    render(<Widgets />);
    expect(screen.getByText('Ejes temáticos')).toBeInTheDocument();
  });
});
