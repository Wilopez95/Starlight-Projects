import styled from 'styled-components';

export const TimeToCome = styled.div`
  color: var(--caption-desaturated);
  text-transform: uppercase;
`;

export const AddressText = styled.div`
  line-height: 20px;
  color: var(--caption-light);
`;

export const WorkOrderIdText = styled.span`
  color: var(--secondary);
  ${({ onClick }) => onClick && 'cursor: pointer;'}
  margin-left: 4px;
`;
