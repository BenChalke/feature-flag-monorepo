// src/__tests__/main.entrypoint.test.jsx

// Hoist this mock so Jest replaces all imports of 'react-dom/client'
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(),
}));

describe('main.jsx entrypoint', () => {
  let ReactDOM;
  let fakeRoot;

  beforeEach(() => {
    // Clear any module cache so our require('../main') re-runs its top-level code
    jest.resetModules();
    document.body.innerHTML = '';

    // Grab the mocked createRoot
    ReactDOM = require('react-dom/client');
    fakeRoot = { render: jest.fn() };
    ReactDOM.createRoot.mockReturnValue(fakeRoot);
  });

  it('calls createRoot and render when #root exists', () => {
    // Put a root container on the page
    document.body.innerHTML = `<div id="root"></div>`;

    // Now require main.jsx, which will run its entrypoint logic
    require('../main');

    // Assert createRoot was called with our container
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(
      document.getElementById('root')
    );
    // And its render() was invoked with the <StrictMode><Main/></StrictMode> tree
    expect(fakeRoot.render).toHaveBeenCalledWith(
      expect.any(Object)
    );
  });

  it('does nothing when #root is missing', () => {
    // No #root in the DOM
    require('../main');
    expect(ReactDOM.createRoot).not.toHaveBeenCalled();
  });
});
