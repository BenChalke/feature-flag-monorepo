import { render, screen, fireEvent } from '@testing-library/react';
import TopBarV2 from '../TopBarV2';

describe('TopBarV2', () => {
  it('renders title and env and add button', () => {
    const onAdd = jest.fn();
    render(<TopBarV2 currentEnv="Prod" onAddFlagClick={onAdd} />);
    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    expect(screen.getByText('Environment:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalled();
  });
});
