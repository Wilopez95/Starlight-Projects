import styled, { css } from 'styled-components';

export const Form = styled.form<{ fullHeight?: boolean }>`
  ${props =>
    props.fullHeight &&
    css`
      height: 100%;
    `}
`;
