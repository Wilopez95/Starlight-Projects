import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash';

import { Badge, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { ChatStatus } from '@root/consts';
import { useStores } from '@root/hooks';

import MessageContainer from './components/MessagesContainer/MessagesContainer';

export const ChatQuickViewRightPanel: React.FC = () => {
  const { chatStore } = useStores();
  const selectedChat = chatStore.selectedEntity;

  return (
    <Layouts.Box as={Layouts.Flex} height="100%" direction="column">
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{selectedChat?.customerName}</Typography>
        <Badge color={selectedChat?.status === ChatStatus.Pending ? 'primary' : 'success'}>
          {startCase(selectedChat?.status)}
        </Badge>
        <Divider top />
      </Layouts.Padding>
      <MessageContainer />
      <Layouts.Padding top="1" />
    </Layouts.Box>
  );
};
