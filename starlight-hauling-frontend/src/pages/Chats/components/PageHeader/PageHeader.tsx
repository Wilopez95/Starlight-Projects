import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Switch } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useBusinessContext, useStores } from '@root/hooks';

const I18N_PATH = 'pages.Chats.table.Text.';

const PageHeader: React.FC = () => {
  const { t } = useTranslation();
  const { chatStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const checkedChatsCount = chatStore.checkedChats.length;

  const handleChangeOnlyMine = useCallback(() => {
    chatStore.toggleOnlyMine();
    chatStore.request({ businessUnitId });
  }, [chatStore, businessUnitId]);

  const handleChatsResolved = useCallback(() => {
    chatStore.markAsResolvedGroupOfChats();
  }, [chatStore]);

  return (
    <Layouts.Padding top="2" bottom="2.5">
      <Layouts.Box as={Layouts.Flex} justifyContent="space-between" alignItems="center">
        <Typography as="h1" variant="headerTwo" fontWeight="bold">
          {checkedChatsCount === 0
            ? t('Titles.Chats')
            : t(`${I18N_PATH}ChatsSelected`, { checkedChatsCount })}
        </Typography>
        {checkedChatsCount > 0 ? (
          <Layouts.Margin left="auto" right="2">
            <Button variant="primary" onClick={handleChatsResolved}>
              {t(`${I18N_PATH}MarkAdResolved`)}
            </Button>
          </Layouts.Margin>
        ) : null}
        <Switch
          id="pageHeaderSwitch"
          name="pageHeaderSwitch"
          onChange={handleChangeOnlyMine}
          value={chatStore.mineOnly}
        >
          {t(`${I18N_PATH}ShowOnlyMyChats`)}
        </Switch>
      </Layouts.Box>
    </Layouts.Padding>
  );
};

export default observer(PageHeader);
