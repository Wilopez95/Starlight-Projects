import styled, { css } from 'styled-components';

interface ITableHeaderStyledProps {
  sticky: boolean;
}

export const TableHeaderStyled = styled.thead<ITableHeaderStyledProps>`
  padding: 4px 16px;
  z-index: var(--tableNavigationZindex);

  & th {
    padding: 10px 0;
    box-shadow: 0 2px 0 0 var(--primary-gray);
    background-color: white;
    border-bottom: 2px solid var(--primary-gray);
    height: 60px;
  }

  ${p =>
    p.sticky &&
    css`
      & th {
        position: sticky;
        top: 0px;
        z-index: var(--tableNavigationZindex);
        border-bottom: none;
      }
    `}
`;
