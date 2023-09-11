import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import styled from 'styled-components';

import { IMessage } from './types';

const MessageBackground = styled.div`
  background-color: ${props => props.color};
  border-radius: 0.5rem;
`;

export const Message: React.FC<IMessage> = ({ backgroundColor, message }) => (
  <MessageBackground color={backgroundColor}>
    <Layouts.Padding padding="2">
      <Typography>{message}</Typography>
    </Layouts.Padding>
  </MessageBackground>
);
