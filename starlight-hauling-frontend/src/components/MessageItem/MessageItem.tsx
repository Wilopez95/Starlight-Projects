import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';

import { Message } from './styles';
import { IMessageItem } from './types';

const MessageItem: React.FC<IMessageItem> = ({ author, time, message, isMyMessage }) => (
  <Layouts.Padding top="1" bottom="1" left="3" right="3">
    <Layouts.Flex direction="column" alignItems={isMyMessage ? 'flex-end' : 'flex-start'}>
      <Typography as="p" variant="bodyMedium">
        {author}
      </Typography>
      <Typography as="p" color="secondary" variant="bodySmall">
        {time}
      </Typography>
    </Layouts.Flex>
    <Message isMyMessage={isMyMessage}>{message}</Message>
  </Layouts.Padding>
);

export default MessageItem;
