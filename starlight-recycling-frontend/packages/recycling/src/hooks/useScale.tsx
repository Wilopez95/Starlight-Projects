import { useContext } from 'react';
import { ScaleContext } from '../components/Scale/ScaleContext';

export function useScale() {
  return useContext(ScaleContext);
}
