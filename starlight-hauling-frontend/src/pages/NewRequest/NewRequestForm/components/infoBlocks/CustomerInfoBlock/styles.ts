import styled from 'styled-components';

export const BalanceRow = styled.div`
  padding-bottom: ${props => props.theme.offsets['1']};

  &:last-child {
    padding-bottom: 0;
  }
`;
