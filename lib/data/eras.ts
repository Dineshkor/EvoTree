import type { EraPalette } from '../types';

export const ERAS: EraPalette[] = [
  {
    id: 'origin',
    name: 'Hydrothermal Origin',
    from: '#02040a',
    to: '#0b0f1a',
    accent: '#ff6a3d',
    particle: 'ember',
  },
  {
    id: 'cambrian',
    name: 'Cambrian Explosion',
    from: '#02121a',
    to: '#04323a',
    accent: '#2ef2d0',
    particle: 'mote',
  },
  {
    id: 'land',
    name: 'Primordial Swamp',
    from: '#04160f',
    to: '#0c3a25',
    accent: '#6dff9e',
    particle: 'mist',
  },
  {
    id: 'extinction',
    name: 'Mass Extinction',
    from: '#1a0505',
    to: '#3a0d05',
    accent: '#ff3b2f',
    particle: 'ash',
  },
  {
    id: 'present',
    name: 'Modern Biosphere',
    from: '#041424',
    to: '#0b3b55',
    accent: '#54d6ff',
    particle: 'bubble',
  },
];
