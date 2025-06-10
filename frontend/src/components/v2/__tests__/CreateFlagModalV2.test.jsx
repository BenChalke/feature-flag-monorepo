import { render, screen, fireEvent } from '@testing-library/react';
import CreateFlagModalV2 from '../CreateFlagModalV2';
import { EnvContext } from '../LayoutV2';

describe('CreateFlagModalV2', () => {
  const onClose = jest.fn();
  const onCreate = jest.fn();
  const defaultEnv = 'Staging';

  function setup(open = true) {
    return render(
      <EnvContext.Provider value="Production">
        <CreateFlagModalV2
          isOpen={open}
          onClose={onClose}
          onCreate={onCreate}
          defaultEnv={defaultEnv}
        />
      </EnvContext.Provider>
    );
  }

  it('does not render when closed', () => {
    setup(false);
    expect(screen.queryByText('Create New Flag')).toBeNull();
  });

  it('renders form fields and default env', () => {
    setup();
    expect(screen.getByText('Create New Flag')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText(defaultEnv)).toBeInTheDocument();
  });

  it('allows environment dropdown selection', () => {
    setup();
    fireEvent.click(screen.getByText(defaultEnv));
    fireEvent.click(screen.getByText('Development'));
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('submits with correct data', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'F' }});
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'D' }});
    fireEvent.change(screen.getByLabelText(/Tags/), { target: { value: 'a,b' }});
    fireEvent.click(screen.getByText('Create'));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'F',
        environment: defaultEnv,
        description: 'D',
        tags: ['a','b'],
      })
    );
  });

  it('invokes onClose', () => {
    setup();
    fireEvent.click(screen.getByLabelText(/times/i));
    expect(onClose).toHaveBeenCalled();
  });
});
