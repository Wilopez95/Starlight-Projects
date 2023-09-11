import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll } from '@root/common/TableTools';
import { MessageItem } from '@root/components';
import { useScrollContainerHeight, useStores, useUserContext } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IMessage } from '@root/types';

const I18N_PATH = 'pages.Chats.Form.Text.';

const MessageContainer: React.FC = () => {
  const { messageStore, chatStore } = useStores();
  const selectedChat = chatStore.selectedEntity;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollContainerHeight } = useScrollContainerHeight({ containerRef });
  const { currentUser } = useUserContext();
  const { dateFormat } = useIntl();
  const { t } = useTranslation();

  const loadMessages = useCallback(() => {
    if (selectedChat?.id) {
      messageStore.request(selectedChat.id);
    }
  }, [messageStore, selectedChat?.id]);

  useEffect(() => {
    messageStore.cleanup();
    loadMessages();
  }, [messageStore, loadMessages]);

  return (
    <Layouts.Box ref={containerRef} height="100%">
      <Layouts.Scroll scrollReverse maxHeight={scrollContainerHeight}>
        {messageStore.sortedValues.map((value: IMessage) => (
          <MessageItem
            key={value.id}
            author={value.authorName}
            time={format(value.createdAt as Date, dateFormat.dateMonthYearTime)}
            message={value.message}
            isMyMessage={value.userId === currentUser?.id}
          />
        ))}
        <TableInfiniteScroll
          onLoaderReached={loadMessages}
          loaded={messageStore.loaded}
          loading={messageStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH}LoadingMessages`)}
        </TableInfiniteScroll>
      </Layouts.Scroll>
    </Layouts.Box>
  );
};

export default observer(MessageContainer);
