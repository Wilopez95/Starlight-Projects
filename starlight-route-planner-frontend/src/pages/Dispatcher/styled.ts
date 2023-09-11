import styled from 'styled-components';

export const CalendarWrapper = styled.div`
  & > div {
    display: flex;
    align-items: flex-end;
    position: relative;
    z-index: 3;

    & > div:first-child {
      margin-right: 1rem;
      padding-top: 12px;
    }
  }
`;
