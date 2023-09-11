import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { hasDataAttribute } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ChatQuickView } from '@root/quickViews';

import { getBadgeByStatus } from './helpers/getBadgeByStatus';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.Chats.table.Text.';

const ChatsTable: React.FC = () => {
  const { chatStore } = useStores();
  const { t } = useTranslation();
  const selectedChat = chatStore.selectedEntity;
  const tbodyContainerRef = useRef(null);
  const { dateFormat } = useIntl();
  const { businessUnitId } = useBusinessContext();

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      chatStore.checkAll(e.target.checked);
    },
    [chatStore],
  );

  const isAllChecked = chatStore.isAllChecked;
  const checkedChats = chatStore.checkedChats;
  const indeterminate = !isAllChecked && checkedChats.length > 0;

  const handleRequest = useCallback(() => {
    chatStore.request({ businessUnitId });
  }, [chatStore, businessUnitId]);

  useEffect(() => {
    chatStore.cleanup();
    handleRequest();
    chatStore.requestCount({ businessUnitId });
  }, [chatStore, handleRequest, businessUnitId]);

  return (
    <>
      <ChatQuickView isOpen={chatStore.isOpenQuickView} clickOutContainers={tbodyContainerRef} />
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableCheckboxCell
              header
              name="AllChats"
              onChange={handleCheckAll}
              value={isAllChecked}
              indeterminate={indeterminate}
            />
            <TableTools.HeaderCell>{t(`${I18N_PATH}LastUpdate`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Customer`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}CustomerContact`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}User`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Status`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}LastMessage`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody
            cells={7}
            loading={chatStore.loading}
            ref={tbodyContainerRef}
            noResult={chatStore.noResult}
          >
            {chatStore.sortedValues.map(chat => (
              <TableRow
                key={chat.id}
                selected={selectedChat?.id === chat.id}
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  if (hasDataAttribute(e, 'skipEvent')) {
                    return;
                  }

                  chatStore.selectEntity(chat);
                }}
                className={chat.read ? undefined : styles.rowBold}
              >
                <TableCheckboxCell
                  name={`chat-${chat.id}`}
                  onChange={chat.check}
                  value={chat.checked}
                />
                <TableCell>{format(chat.lastMsgTimestamp, dateFormat.dateMonthYearTime)}</TableCell>
                <TableCell>{chat.customerName}</TableCell>
                <TableCell>{chat.contactName}</TableCell>
                <TableCell>{chat.lastReplier}</TableCell>
                <TableCell>{getBadgeByStatus(chat.status)}</TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{chat.lastMessage}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableInfiniteScroll
          onLoaderReached={handleRequest}
          loaded={chatStore.loaded}
          loading={chatStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH}LoadingChats`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(ChatsTable);
