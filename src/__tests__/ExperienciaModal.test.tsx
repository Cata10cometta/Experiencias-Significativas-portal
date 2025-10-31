import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExperienceModal from '../components/ExperienceModal';

describe('ExperienceModal', () => {
  it('no renderiza nada si show es false', () => {
  const { container } = render(<ExperienceModal show={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el modal si show es true', () => {
  const { getByText } = render(<ExperienceModal show={true} onClose={() => {}} />);
    expect(getByText('INFORMACIÓN DE LA EXPERIENCIA')).toBeInTheDocument();
  });

  it('llama a onClose al hacer click en el botón de cerrar', () => {
    const onCloseMock = vi.fn();
  const { getByLabelText } = render(<ExperienceModal show={true} onClose={onCloseMock} />);
    fireEvent.click(getByLabelText('Cerrar'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
