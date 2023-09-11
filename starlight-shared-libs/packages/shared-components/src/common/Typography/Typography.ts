import styled, { css } from 'styled-components';

import { ITypographyLayout } from './types';

export const Typography = styled.div<ITypographyLayout>`
  font-family: Roboto, Helvetica, Arial, sans-serif;
  color: ${props => props.theme.colors[props.color ?? 'default'][props.shade ?? 'standard']};
  text-transform: ${props => props.textTransform ?? 'none'};
  text-align: ${props => props.textAlign ?? 'initial'};

  ${props =>
    (props.cursor || props.onClick) &&
    css`
      cursor: ${props.cursor ?? 'pointer'};
    `}

  ${props =>
    props.underlined &&
    css`
      text-decoration: dotted underline;
    `};

  ${props =>
    props.variant === 'headerOne' &&
    css`
      font-weight: ${props => props.theme.fontWeights.medium};
      font-size: 4rem;
      line-height: 5.5rem;
    `}

  ${props =>
    props.variant === 'headerTwo' &&
    css`
      font-weight: ${props => props.theme.fontWeights.medium};
      font-size: 3.5rem;
      line-height: 5rem;
    `}

  ${props =>
    props.variant === 'headerThree' &&
    css`
      font-weight: ${props => props.theme.fontWeights.medium};
      font-size: 2.5rem;
      line-height: 3.75rem;
    `}

  ${props =>
    props.variant === 'headerFour' &&
    css`
      font-weight: ${props => props.theme.fontWeights.medium};
      font-size: 2rem;
      line-height: 3rem;
    `}

  ${props =>
    props.variant === 'headerFive' &&
    css`
      font-weight: ${props => props.theme.fontWeights.medium};
      font-size: 1.75rem;
      line-height: 2.5rem;
    `}

  ${props =>
    props.variant === 'bodyLarge' &&
    css`
      font-weight: ${props => props.theme.fontWeights.normal};
      font-size: 2rem;
      line-height: 2.75rem;
    `}

  ${props =>
    props.variant === 'bodyMedium' &&
    css`
      font-weight: ${props => props.theme.fontWeights.normal};
      font-size: 1.75rem;
      line-height: 2.5rem;
    `}

  ${props =>
    props.variant === 'bodySmall' &&
    css`
      font-weight: ${props => props.theme.fontWeights.normal};
      font-size: 1.5rem;
      line-height: 2.25rem;
    `}

  ${props =>
    props.variant === 'caption' &&
    css`
      font-weight: ${props => props.theme.fontWeights.medium};
      font-size: 1.5rem;
      line-height: 2.25rem;
      letter-spacing: 1px;
    `}

  ${props =>
    props.ellipsis &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}

  ${({ fontWeight, theme }) =>
    fontWeight &&
    css`
      font-weight: ${theme.fontWeights[fontWeight]};
    `};

  ${({ textDecoration }) =>
    textDecoration &&
    css`
      text-decoration: ${textDecoration};
    `};
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
    `};
`;

Typography.defaultProps = {
  as: 'div',
};
