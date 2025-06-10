import { render, screen } from '@testing-library/react';
import LayoutV2, { EnvContext } from '../LayoutV2';

describe('LayoutV2', () => {
  it('provides EnvContext and renders children', () => {
    render(
      <LayoutV2 onAddFlagClick={()=>{}}>
        <div>Child</div>
      </LayoutV2>
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});
