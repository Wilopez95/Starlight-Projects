import { StarlightLogo } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const StyledForm = styled.form`
  width: 70%;
`;

export const StyledButton = styled.button`
  cursor: pointer;

  text-align: center;
  font-size: 16px;
  line-height: 44px;

  width: 100%;
  height: 44px;
  border-radius: 3px;

  color: ${props => props.theme.colors.white.standard};
  background-color: ${props => props.theme.colors.primary.standard};
  border: ${props => `1px solid ${props.theme.colors.primary.standard}`};

  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
    border: ${props =>
      `1px solid ${props.theme.colors.primary.dark ?? props.theme.colors.primary.standard}`};
  }

  &:focus {
    border: ${props =>
      `1px solid ${props.theme.colors.primary.dark ?? props.theme.colors.primary.standard}`};
  }
`;

export const Image = styled(StarlightLogo)`
  width: 166px;
  height: 55px;
  margin: 0 0 40px 0;
`;
