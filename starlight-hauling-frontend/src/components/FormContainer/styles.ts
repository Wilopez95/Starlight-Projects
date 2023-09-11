import styled, { css } from 'styled-components';

type FormProps = {
  fullHeight?: boolean;
};

export const Form = styled.form<FormProps>`
  ${props =>
    props.fullHeight &&
    css`
      height: 100%;
    `}
`;
