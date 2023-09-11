import styled from 'styled-components';

export const ValidationError = styled.div`
  min-height: 20px;
  margin-top: 12px;
  color: ${props => props.theme.colors.alert.dark};
  font-size: 12px;
`;
