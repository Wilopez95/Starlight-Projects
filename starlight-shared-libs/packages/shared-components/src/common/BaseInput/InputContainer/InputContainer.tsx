import React from 'react';

import { Layouts } from '../../../layouts';
import { Typography } from '../../Typography/Typography';

import { StyledInputContainer, StyledInputLayoutContainer } from './styles';
import { IInputContainer } from './types';

export const InputContainer: React.FC<IInputContainer> = ({
  children,
  error,
  id,
  label,
  noErrorMessage,
  className,
  size,
  disabled,
  center,
  inputRef,
}) => (
  <StyledInputLayoutContainer className={className} disabled={disabled}>
    {label ? (
      <Layouts.Margin top="0.5" bottom="0.5">
        <Layouts.Flex justifyContent={center ? 'center' : 'flex-start'}>
          <Typography
            color="secondary"
            as="label"
            shade="desaturated"
            variant="bodyMedium"
            htmlFor={id}
          >
            {label}
          </Typography>
        </Layouts.Flex>
      </Layouts.Margin>
    ) : null}
    <StyledInputContainer ref={inputRef} size={size} center={center}>
      {children}
    </StyledInputContainer>
    {!noErrorMessage ? (
      <Layouts.Box minHeight="20px">
        <Layouts.Margin top="0.5" bottom="0.5">
          <Typography color="alert" variant="bodySmall">
            {error}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
    ) : null}
  </StyledInputLayoutContainer>
);
