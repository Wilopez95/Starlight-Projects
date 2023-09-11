import styled, { css } from 'styled-components';

import { Status } from './types';

type DayLabelType = {
  status: Status;
  requiredByCustomer?: boolean;
  isLinked?: boolean;
};

export const DayLabel = styled.p<DayLabelType>`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-right: 4px;

  ${props =>
    props.status === Status.active &&
    css`
      color: #e87900;
      cursor: pointer;
    `}

  ${props =>
    props.status === Status.active &&
    props.isLinked &&
    css`
      color: #006fbb;
    `}
  
  ${props =>
    props.status === Status.inactive &&
    css`
      color: #637381;
    `}

  ${props =>
    props.status === Status.disabled &&
    css`
      color: #dfe3e8;
    `}

  ${props =>
    props.requiredByCustomer &&
    css`
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;
    `}
`;
