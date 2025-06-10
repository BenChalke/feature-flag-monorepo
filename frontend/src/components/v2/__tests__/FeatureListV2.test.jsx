import { render, screen, fireEvent } from '@testing-library/react';
import FeatureListV2 from '../FeatureListV2';
import { EnvContext } from '../LayoutV2';

const rows = [
  { id: 1, name: 'A', environment:'Dev', enabled:true, created_at:'2025-01-01', modified_at:'' },
  { id: 2, name: 'B', environment:'Dev', enabled:false, created_at:'2025-01-02', modified_at:'' },
];

describe('FeatureListV2', () => {
  const onToggle = jest.fn();
  const onEdit = jest.fn();

  beforeAll(() => {
    // hack: treat 'Dev' as current env
    jest.spyOn(console, 'error').mockImplementation(()=>{});
  });

  afterEach(() => jest.clearAllMocks());

  function setup() {
    return render(
      <EnvContext.Provider value="Dev">
        <FeatureListV2 flags={rows} onToggle={onToggle} onEdit={onEdit} updatingFlag={null}/>
      </EnvContext.Provider>
    );
  }

  it('shows header', () => {
    setup();
    expect(screen.getByText('Dev Environment')).toBeInTheDocument();
  });

  it('filters by search', () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText('Search flags...'), { target:{ value:'B' }});
    expect(screen.queryByText('A')).toBeNull();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('sorts by name', () => {
    setup();
    fireEvent.change(screen.getByRole('combobox'), { target:{ value:'name'}});
    // toggle direction
    fireEvent.click(screen.getByLabelText('Toggle sort direction'));
  });

  it('renders flag cards', () => {
    setup();
    expect(screen.getAllByText(/Created:/)).toHaveLength(2);
  });
});
