import styled from 'styled-components';

export const BalanceRow = styled.tr`
  &:last-child td {
    padding-bottom: 0;
  }
`;

export const BalanceCell = styled.td`
  padding: 0;
  padding-right: ${props => props.theme.offsets['1']};
  padding-bottom: ${props => props.theme.offsets['1']};

  &:last-child {
    padding-right: 0;
  }
`;
