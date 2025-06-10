import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmV2 from '../DeleteConfirmV2';

describe('DeleteConfirmV2', () => {
  const props = {
    flagName: 'MyFlag',
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    loading: false,
  };

  it('renders question with flag name', () => {
    render(<DeleteConfirmV2 {...props} />);
    expect(screen.getByText(/delete the flag/i)).toHaveTextContent('MyFlag');
  });

  it('invokes cancel and confirm', () => {
    render(<DeleteConfirmV2 {...props} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(props.onCancel).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Delete'));
    expect(props.onConfirm).toHaveBeenCalled();
  });
});
