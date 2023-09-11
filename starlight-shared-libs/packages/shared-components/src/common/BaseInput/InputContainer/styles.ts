import styled, { css } from 'styled-components';

import { getInputContainerSize } from '../helpers';

import { InputContainerSize, IStyledInputLayoutContainer } from './types';

export const StyledInputLayoutContainer = styled.div<IStyledInputLayoutContainer>`
  width: 100%;
  font-size: 1.75rem;

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
    `}
`;

export const StyledInputContainer = styled.div<{ size?: InputContainerSize; center?: boolean }>(
  ({ size, center }) => ({
    width: '100%',
    minHeight: getInputContainerSize(size),
    ...(center
      ? {
          display: 'flex',
          justifyContent: center ? 'center' : 'flex-start',
        }
      : {}),
  }),
);
