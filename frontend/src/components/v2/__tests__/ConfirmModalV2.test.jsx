import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModalV2 from '../ConfirmModalV2';

describe('ConfirmModalV2', () => {
  const defaultProps = {
    title: 'Test Title',
    children: <p>Body text</p>,
    cancelText: 'No',
    confirmText: 'Yes',
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
    loading: false,
  };

  it('renders title, body, and buttons', () => {
    render(<ConfirmModalV2 {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('calls onCancel and onConfirm', () => {
    render(<ConfirmModalV2 {...defaultProps} />);
    fireEvent.click(screen.getByText('No'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Yes'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<ConfirmModalV2 {...defaultProps} loading={true} />);
    const confirmButton = screen.getByText('Yes');
    // spinner is an element with role="none" inside button
    expect(confirmButton.previousSibling).toHaveClass('animate-spin');
    expect(confirmButton).toHaveClass('opacity-0');
  });
});
