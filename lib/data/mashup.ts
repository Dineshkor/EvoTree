export interface MashupOrganism {
  id: string;
  emoji: string;
  label: string;
  parent: string;
}

export const MASHUP_ORGANISMS: MashupOrganism[] = [
  { id: 'human', emoji: '🧍', label: 'Human', parent: 'synapsids' },
  { id: 'land-wolf', emoji: '🐺', label: 'Land Wolf', parent: 'synapsids' },
  { id: 'mushroom', emoji: '🍄', label: 'Mushroom', parent: 'eukaryotes' },
];

export const MASHUP_PAIRS: Record<string, { verdict: string }> = {
  'human|mushroom': {
    verdict:
      'You and a mushroom split 1.5 billion years ago — fungi are closer to you than to plants!',
  },
  'blue-whale|land-wolf': {
    verdict:
      'A wolf and a whale are both mammals — they share a furry four-legged ancestor that survived the asteroid that killed the dinosaurs.',
  },
};

export function mashupKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}
