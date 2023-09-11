import styled from 'styled-components';

export const DnDList = styled.div<{ error?: string }>`
  border-radius: 4px;
  position: relative;
  ${props => `border: 1px dashed var(--${props.error ? 'destructive' : 'primary-gray'})`};
`;

export const DnDListTitle = styled.div`
  padding: 32px 0;
  text-align: center;
  font-size: 12px;
  color: var(--caption-desaturated);
`;
