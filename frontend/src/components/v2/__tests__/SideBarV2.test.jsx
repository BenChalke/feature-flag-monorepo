import { render, screen, fireEvent } from '@testing-library/react';
import SidebarV2 from '../SideBarV2';

describe('SidebarV2', () => {
  it('toggles collapse and calls onChange', () => {
    const onChange = jest.fn();
    render(<SidebarV2 activeEnv="Staging" onChange={onChange} />);
    // initially collapsed
    fireEvent.click(screen.getByRole('button', { name: /chevron-right/i }));
    // expand
    expect(screen.getByText('Environments')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Staging', {selector:'div'}));
    expect(onChange).toHaveBeenCalledWith('Staging');
  });
});
