import styled, { css } from 'styled-components';

import { IButtonLayout } from './types';

export const Button = styled.button<IButtonLayout>`
  position: relative;
  cursor: pointer;
  font-size: 1.75rem;
  border-radius: 3px;
  min-width: 7rem;
  height: 4rem;

  color: ${props => props.theme.colors.primary.standard};
  background-color: ${props => props.theme.colors.white.standard};
  border: 1px solid ${props => props.theme.colors.grey.standard};

  &:hover {
    background-color: ${props => props.theme.colors.primary.desaturated};
    border: 1px solid ${props => props.theme.colors.primary.standard};
  }

  &:focus {
    border: 1px solid ${props => props.theme.colors.primary.standard};
  }

  ${props => props.full && 'width: 100%'};

  ${props =>
    props.variant === 'primary' &&
    css`
      color: ${props => props.theme.colors.white.standard};
      background-color: ${props => props.theme.colors.primary.standard};
      border: ${props => `1px solid ${props.theme.colors.primary.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.primary.dark};
        border: ${props =>
          `1px solid ${props.theme.colors.primary.dark ?? props.theme.colors.primary.standard}`};
      }

      &:focus {
        border: ${props =>
          `1px solid ${props.theme.colors.primary.dark ?? props.theme.colors.primary.standard}`};
      }
    `}

  ${props =>
    props.variant === 'secondary' &&
    css`
      color: ${props => props.theme.colors.white.standard};
      background-color: ${props => props.theme.colors.secondary.standard};
      border: ${props => `1px solid ${props.theme.colors.secondary.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.secondary.dark};
        border: ${props =>
          `1px solid ${
            props.theme.colors.secondary.dark ?? props.theme.colors.secondary.standard
          }`};
      }

      &:focus {
        border: ${props =>
          `1px solid ${
            props.theme.colors.secondary.dark ?? props.theme.colors.secondary.standard
          }`};
      }
    `}

  ${props =>
    props.variant === 'success' &&
    css`
      color: ${props => props.theme.colors.white.standard};
      background-color: ${props => props.theme.colors.success.standard};
      border: ${props => `1px solid ${props.theme.colors.success.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.success.dark};
        border: ${props =>
          `1px solid ${props.theme.colors.success.dark ?? props.theme.colors.success.standard}`};
      }

      &:focus {
        border: ${props =>
          `1px solid ${props.theme.colors.success.dark ?? props.theme.colors.success.standard}`};
      }
    `}

  ${props =>
    props.variant === 'alert' &&
    css`
      color: ${props => props.theme.colors.white.standard};
      background-color: ${props => props.theme.colors.alert.standard};
      border: ${props => `1px solid ${props.theme.colors.alert.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.alert.dark};
        border: ${props =>
          `1px solid ${props.theme.colors.alert.dark ?? props.theme.colors.alert.standard}`};
      }

      &:focus {
        border: ${props =>
          `1px solid ${props.theme.colors.alert.dark ?? props.theme.colors.alert.standard}`};
      }
    `}

  ${props =>
    props.variant === 'information' &&
    css`
      color: ${props => props.theme.colors.white.standard};
      background-color: ${props => props.theme.colors.information.standard};
      border: ${props => `1px solid ${props.theme.colors.information.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.information.dark};
        border: ${props =>
          `1px solid ${
            props.theme.colors.information.dark ?? props.theme.colors.information.standard
          }`};
      }

      &:focus {
        border: ${props =>
          `1px solid ${
            props.theme.colors.information.dark ?? props.theme.colors.information.standard
          }`};
      }
    `}

  ${props =>
    props.disabled &&
    css`
      color: ${props => props.theme.colors.white.standard};
      background-color: ${props => props.theme.colors.grey.standard};
      border: ${props => `1px solid ${props.theme.colors.grey.standard}`};
      cursor: not-allowed;

      &:hover,
      &:focus {
        background-color: ${props => props.theme.colors.grey.standard};
        border: ${props => `1px solid ${props.theme.colors.grey.standard}`};
        position: initial;
      }

      * {
        cursor: not-allowed;
        color: #919eab;
      }
    `}

  ${props =>
    props.variant === 'conversePrimary' &&
    css`
      color: ${props => props.theme.colors.primary.standard};
      background-color: ${props => props.theme.colors.white.standard};
      border: ${props => `1px solid ${props.theme.colors.primary.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.primary.desaturated};
        border: ${props => `1px solid ${props.theme.colors.primary.standard}`};
      }

      &:focus {
        border: ${props => `1px solid ${props.theme.colors.primary.standard}`};
      }
    `}

  ${props =>
    props.variant === 'converseSuccess' &&
    css`
      color: ${props => props.theme.colors.success.standard};
      background-color: ${props => props.theme.colors.white.standard};
      border: ${props => `1px solid ${props.theme.colors.success.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.success.desaturated};
        border: ${props => `1px solid ${props.theme.colors.success.standard}`};
      }

      &:focus {
        border: ${props => `1px solid ${props.theme.colors.success.standard}`};
      }
    `}

  ${props =>
    props.variant === 'converseInformation' &&
    css`
      color: ${props => props.theme.colors.information.standard};
      background-color: ${props => props.theme.colors.white.standard};
      border: ${props => `1px solid ${props.theme.colors.information.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.information.desaturated};
        border: ${props => `1px solid ${props.theme.colors.information.standard}`};
      }

      &:focus {
        border: ${props => `1px solid ${props.theme.colors.information.standard}`};
      }
    `}

  ${props =>
    props.variant === 'converseAlert' &&
    css`
      color: ${props => props.theme.colors.alert.standard};
      background-color: ${props => props.theme.colors.white.standard};
      border: ${props => `1px solid ${props.theme.colors.alert.standard}`};

      &:hover {
        background-color: ${props => props.theme.colors.alert.desaturated};
        border: ${props => `1px solid ${props.theme.colors.alert.standard}`};
      }

      &:focus {
        border: ${props => `1px solid ${props.theme.colors.alert.standard}`};
      }
    `}

  ${props =>
    props.variant === 'none' &&
    css`
      color: ${props => props.theme.colors.alert.standard};
      background-color: transparent;
      border: none;

      &:hover,
      &:focus {
        background-color: transparent;
        border: none;
      }
    `}

  ${props =>
    props.size === 'medium' &&
    css`
      min-width: 10rem;
      height: 4.5rem;
    `}

  ${props =>
    props.size === 'large' &&
    css`
      min-width: 12rem;
      height: 5.5rem;
      font-size: 2rem;
    `}

  ${props =>
    props.borderless &&
    css`
      border: none;
    `}

    ${props =>
    props.loading &&
    css`
      .button-content {
        visibility: hidden;
        opacity: 0;
      }

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        border: 4px solid transparent;
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: button-loading-spinner 1s ease infinite;
      }

      @keyframes button-loading-spinner {
        from {
          transform: rotate(0turn);
        }

        to {
          transform: rotate(1turn);
        }
      }
    `}
`;
