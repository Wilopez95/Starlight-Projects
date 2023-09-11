import styled, { css } from 'styled-components';

export const PinWrapper = styled.div`
  position: relative;
`;

export const MultipleItemsCounter = styled.div`
  position: absolute;
  background: var(--primary-gray-desaturated);
  border: 1px solid var(--caption-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: var(--caption-dark);
  font-size: 10px;
  line-height: 18px;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
`;

export const SequenceText = styled.span<{
  size: 'small' | 'large';
  color?: string;
}>`
  ${({ size }) =>
    size === 'small' &&
    css`
      font-style: normal;
      font-weight: bold;
      font-size: 10px;
      line-height: 18px;
    `}
  ${({ size }) =>
    size === 'large' &&
    css`
      font-style: normal;
      font-weight: 900;
      font-size: 14px;
      line-height: 16px;
    `}
  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `}
`;
