import { render, screen, fireEvent } from '@testing-library/react';
import FlagCardV2 from '../FlagCardV2';

const flag = {
  name:'X',
  createdAt:'2025-01-01T00:00:00Z',
  modifiedAt:'2025-01-02T00:00:00Z',
  description:'Desc',
  tags:['t'],
  environments:{ Dev:{id:1,enabled:true} }
};

describe('FlagCardV2', () => {
  it('renders name, tags, desc and timestamps', () => {
    render(<FlagCardV2
      flag={flag}
      currentEnv="Dev"
      onToggle={()=>{}}
      onEdit={()=>{}}
      isUpdating={false}
    />);
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('t')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Modified:/)).toBeInTheDocument();
  });

  it('calls onToggle and onEdit', () => {
    const onToggle = jest.fn();
    const onEdit = jest.fn();
    render(<FlagCardV2
      flag={flag}
      currentEnv="Dev"
      onToggle={onToggle}
      onEdit={onEdit}
      isUpdating={true}
    />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
  });
});
