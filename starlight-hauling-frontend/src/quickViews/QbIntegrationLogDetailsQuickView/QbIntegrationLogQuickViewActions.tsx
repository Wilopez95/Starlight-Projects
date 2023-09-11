import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';
import { useQuickViewContext } from '@root/common';

const QbIntegrationLogQuickViewActions: React.FC = () => {
  const { closeQuickView } = useQuickViewContext();
  const { t } = useTranslation();
  return (
    <Layouts.Flex justifyContent="space-between">
      <Button onClick={closeQuickView}>{t('Text.Cancel')}</Button>
    </Layouts.Flex>
  );
};

export default observer(QbIntegrationLogQuickViewActions);
