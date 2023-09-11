import styled from 'styled-components';

import { getInputSize } from './helpers';
import { IInputLayout } from './types';

//TODO change margin to padding after refactor all inputs

export const InputLayout = styled.div<IInputLayout>(
  ({ theme, offsetLeft, offsetRight, size = 'full' }) => {
    return {
      marginLeft: theme.offsets[offsetLeft ? '2' : '0'],
      marginRight: theme.offsets[offsetRight ? '2' : '0'],
      width: getInputSize(size),
    };
  },
);
