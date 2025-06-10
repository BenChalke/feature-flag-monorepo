import { render, screen, fireEvent } from '@testing-library/react';
import EditFlagModalV2 from '../EditFlagModalV2';
import { EnvContext } from '../LayoutV2';

describe('EditFlagModalV2', () => {
  const flag = {
    id: 1,
    name: 'Flag1',
    description: 'Desc',
    tags: ['t1','t2'],
    environments: { Development: { id:1, enabled:true } },
  };
  const onClose = jest.fn();
  const onSave = jest.fn();
  const onRequestDelete = jest.fn();

  function setup(props = {}) {
    return render(
      <EnvContext.Provider value="Development">
        <EditFlagModalV2
          isOpen={true}
          flag={flag}
          onClose={onClose}
          onSave={onSave}
          onRequestDelete={onRequestDelete}
          saving={props.saving}
        />
      </EnvContext.Provider>
    );
  }

  it('renders form with prefilled values', () => {
    setup();
    expect(screen.getByDisplayValue('Flag1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('t1, t2')).toBeInTheDocument();
  });

  it('calls onSave on submit', () => {
    setup();
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith({
      id: 1,
      name: 'Flag1',
      description: 'Desc',
      tags: ['t1','t2'],
    });
  });

  it('displays spinner when saving', () => {
    setup({ saving: true });
    expect(screen.getByRole('button', { name: /save/i }).firstChild).toHaveClass('animate-spin');
  });

  it('calls onRequestDelete', () => {
    setup();
    fireEvent.click(screen.getByText('Delete'));
    expect(onRequestDelete).toHaveBeenCalledWith(1, 'Flag1');
  });

  it('calls onClose', () => {
    setup();
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
