import styled from 'styled-components';

import { DeleteIcon } from '@root/assets';

export const TypeWrapper = styled.div`
  width: 30%;
  min-width: 155px;
  margin-right: 24px;
  display: flex;
  align-items: center;
`;

export const Extension = styled.div`
  min-width: 100px;
  width: 100px;
`;

export const TextOnly = styled.div<{ first: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  margin-bottom: ${({ first }) => (first ? '0' : '25px')};
`;

export const RemoveIcon = styled(DeleteIcon)`
  cursor: pointer;
  width: 15%;
  margin-right: 10px;
  margin-bottom: 25px;

  & path {
    fill: var(--secondary-gray);

    &:hover {
      fill: var(--destructive);
    }
  }
`;

export const RemoveIconFirst = styled(RemoveIcon)`
  margin-bottom: 0;
`;

export const Type = styled.div<{ disabled: boolean }>`
  width: ${({ disabled }) => (disabled ? '100%' : '85%')};
`;
