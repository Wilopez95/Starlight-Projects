import { Button } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const AddButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.success.standard};
  color: ${(props) => props.theme.colors.white.standard};
  &:hover {
    background-color: ${(props) => props.theme.colors.success.light};
  }
`;
