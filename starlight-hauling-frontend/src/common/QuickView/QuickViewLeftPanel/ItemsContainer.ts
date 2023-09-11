import styled from 'styled-components';

export const ItemsContainer = styled.div`
  padding: 0 24px;
  &:first-of-type {
    overflow-y: auto;
  }

  &:not(:first-of-type) {
    margin-top: 24px;
  }
`;
