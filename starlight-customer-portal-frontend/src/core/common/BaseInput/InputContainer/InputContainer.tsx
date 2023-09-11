import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import * as Styles from './styles';
import { IInputContainer } from './types';

export const InputContainer: React.FC<IInputContainer> = ({
  children,
  error,
  id,
  label,
  noErrorMessage,
  className,
}) => (
  <Styles.StyledInputContainer className={className}>
    {label && (
      <Layouts.Margin top='0.5' bottom='0.5'>
        <Typography
          color='secondary'
          as='label'
          shade='desaturated'
          variant='bodyMedium'
          htmlFor={id}
        >
          {label}
        </Typography>
      </Layouts.Margin>
    )}
    <Layouts.Box width='100%' minHeight='38px'>
      {children}
    </Layouts.Box>
    {!noErrorMessage && (
      <Layouts.Box minHeight='20px'>
        <Layouts.Margin top='0.5' bottom='0.5'>
          <Typography color='alert' variant='bodySmall'>
            {error}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
    )}
  </Styles.StyledInputContainer>
);
