import { InputSize } from './types';

export function getInputSize(size: InputSize) {
  switch (size) {
    case 'full':
      return '100%';
    case 'three-quarter':
      return '75%';
    case 'half':
      return '50%';
    case 'quarter':
      return '25%';
    default:
      return '100%';
  }
}
