import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { TablePageContainer, TableTools } from '@root/common/TableTools';

import PageHeader from './components/PageHeader/PageHeader';
import ChatsTable from './ChatsTable';

const ChatsPage: React.FC = () => {
  const pageContainer = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  return (
    <>
      <Helmet title={t('Titles.Chats')} />
      <TablePageContainer ref={pageContainer}>
        <PageHeader />
        <TableTools.ScrollContainer>
          <ChatsTable />
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(ChatsPage);
