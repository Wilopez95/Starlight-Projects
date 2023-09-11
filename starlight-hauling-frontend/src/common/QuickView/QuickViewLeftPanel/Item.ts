import styled, { css } from 'styled-components';

interface IStyledItem {
  inline?: boolean;
  editable?: boolean;
}

export const Item = styled.div<IStyledItem>`
  padding: 12px 0;

  ${p =>
    p.inline &&
    css`
      display: flex;
      justify-content: space-between;
      align-items: center;
    `}

  ${p1 =>
    p1.editable &&
    css`
      cursor: pointer;

      &:hover {
        background-color: ${p2 => p2.theme.colors.grey.light};
      }
    `}
`;
