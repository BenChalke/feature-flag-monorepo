// src/components/__tests__/FlagForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlagForm from '../FlagForm';
import { fetcher } from '../../api';

// 1) Mock fetcher so we can control its behavior
jest.mock('../../api', () => ({
  fetcher: jest.fn(),
}));

describe('FlagForm component', () => {
  let onClose, onCreated;

  beforeEach(() => {
    onClose = jest.fn();
    onCreated = jest.fn().mockResolvedValue();  
    fetcher.mockReset();
  });

  test('shows validation error when name is empty', () => {
    render(
      <FlagForm
        initialEnv="Production"
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    // Submit with no name
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    expect(screen.getByText(/Name cannot be empty/i)).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('calls onClose when Cancel button clicked', () => {
    render(
      <FlagForm
        initialEnv="Production"
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when “X” close icon clicked', () => {
    render(
      <FlagForm
        initialEnv="Production"
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    // aria-label="Close"
    fireEvent.click(screen.getByLabelText(/Close/i));
    expect(onClose).toHaveBeenCalled();
  });

  test('submits correctly and calls fetcher + onCreated', async () => {
    render(
      <FlagForm
        initialEnv="Staging"
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    // fill in name
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: ' My New Flag  ' },
    });
    // change environment
    fireEvent.change(screen.getByLabelText(/Environment/i), {
      target: { value: 'Development' },
    });

    // mock successful POST
    fetcher.mockResolvedValueOnce({});

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    // fetcher should be called with the right URL and payload
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringMatching(/\/flags$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My New Flag',
          environment: 'Development',
        }),
      })
    );

    // wait for onCreated to be called
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });

  test('shows API error when fetcher rejects with info.error', async () => {
    render(
      <FlagForm
        initialEnv="Production"
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    // give it a valid name so validation passes
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'FlagX' },
    });

    // mock a rejection that contains info.error
    fetcher.mockRejectedValueOnce({ info: { error: 'Already exists' } });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    // the error message should appear
    expect(
      await screen.findByText(/Already exists/i)
    ).toBeInTheDocument();

    // onCreated should not be called
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('shows generic error when fetcher rejects without info.error', async () => {
    render(
      <FlagForm
        initialEnv="Production"
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    // give it a valid name
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'FlagY' },
    });

    // mock a generic rejection
    fetcher.mockRejectedValueOnce(new Error('Network down'));

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    expect(
      await screen.findByText(/Network down/i)
    ).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });
});
