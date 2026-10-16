import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CreatureSprite } from '../components/creatures/CreatureSprite';
import { SPECIES } from '../lib/data/species';

describe('CreatureSprite', () => {
  it('renders an svg for every species svgKey', () => {
    for (const s of SPECIES) {
      const { container, unmount } = render(<CreatureSprite svgKey={s.svgKey} />);
      expect(container.querySelector('svg')).toBeTruthy();
      unmount();
    }
  });

  it('renders a fallback rather than throwing on an unknown key', () => {
    const { container } = render(<CreatureSprite svgKey="totally-unknown" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
