import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tour } from '../components/ui/Tour';
import { usePhyloStore, initialPhyloState } from '../store/usePhyloStore';

beforeEach(() => {
  usePhyloStore.setState(initialPhyloState());
  localStorage.clear();
});

describe('Tour', () => {
  it('renders nothing before the cold open finishes', () => {
    usePhyloStore.setState({ coldOpenDone: false, tourDone: false });
    const { container } = render(<Tour />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a centered card when the target element is missing', () => {
    usePhyloStore.setState({ coldOpenDone: true, tourDone: false, tourStep: 0 });
    render(<Tour />);
    expect(screen.getByText(/tree of life/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
  });

  it('persists completion to localStorage', () => {
    usePhyloStore.setState({ coldOpenDone: true, tourDone: false, tourStep: 4 });
    render(<Tour />);
    screen.getByRole('button', { name: /finish/i }).click();
    expect(localStorage.getItem('phyloTourDone')).toBe('1');
    expect(usePhyloStore.getState().tourDone).toBe(true);
  });
});
