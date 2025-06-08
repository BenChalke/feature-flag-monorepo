// src/components/ProtectedLayout.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import ProtectedLayout from '../ProtectedLayout';
import useSessionValidator from '../../hooks/useSessionValidator';

// 1) Mock out your session validator hook so we can grab its callback
jest.mock('../../hooks/useSessionValidator');

// 2) Stub the real modal to something simple:
//    It receives an onClose prop, renders a bit of text and a button,
//    so we can click it and verify window.location.href.
jest.mock('../SessionExpiredModal', () => ({ onClose }) => (
  <div>
    <div>Session Expired</div>
    <button onClick={onClose}>Close</button>
  </div>
));

describe('ProtectedLayout', () => {
  let expireCb;

  beforeEach(() => {
    // Each render, our hook gives us back the expire‐callback:
    useSessionValidator.mockImplementation(cb => {
      expireCb = cb;
    });

    // Make window.location.href mutable in tests
    delete window.location;
    window.location = { href: '' };
  });

  it('does not show modal initially, then shows it when hook expires', () => {
    render(
      <ProtectedLayout>
        <div>CHILDREN</div>
      </ProtectedLayout>
    );
    // modal not there yet
    expect(screen.queryByText(/Session Expired/)).toBeNull();

    // drive the hook’s expire callback
    act(() => {
      expireCb();
    });
    expect(screen.getByText(/Session Expired/)).toBeInTheDocument();
  });

  it('shows modal when a session-expired event is emitted', () => {
    render(
      <ProtectedLayout>
        <div>CHILDREN</div>
      </ProtectedLayout>
    );
    // still no modal
    expect(screen.queryByText(/Session Expired/)).toBeNull();

    // dispatch the global event
    act(() => {
      window.dispatchEvent(new Event('session-expired'));
    });
    expect(screen.getByText(/Session Expired/)).toBeInTheDocument();
  });

  it('hides the modal and redirects to /login when closed', () => {
    render(
      <ProtectedLayout>
        <div>CHILDREN</div>
      </ProtectedLayout>
    );

    // expire via the hook:
    act(() => {
      expireCb();
    });
    expect(screen.getByText(/Session Expired/)).toBeInTheDocument();

    // click our fake modal’s Close button
    fireEvent.click(screen.getByText('Close'));

    // modal should go away and location.href updated
    expect(screen.queryByText(/Session Expired/)).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});
