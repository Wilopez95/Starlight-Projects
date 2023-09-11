import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { StatusBadge } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { QuickViewHeaderTitle } from '@root/quickViews';

import { Tabs } from './Tabs';
import { IForm } from './types';

const I18N_PATH = 'quickViews.WorkOrderView.Text.';

//TODO: remove Form component and place all the info into DetailsQuickView component

export const Form: React.FC<IForm> = ({
  scrollContainerHeight,
  info,
  onAddRef,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Layouts.Box ref={onAddRef} position="relative">
        <Layouts.Padding left="3" right="3" bottom="2">
          <QuickViewHeaderTitle name={info.displayId} showPreview={false}>
            {t(`${I18N_PATH}WorkOrderNumber`)}
            {info.displayId}
          </QuickViewHeaderTitle>
          <Layouts.Margin top="1" />
          <Layouts.Flex alignItems="center">
            <StatusBadge status={info.status} routeType="work-orders" />
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
      <Tabs
        workOrder={info}
        scrollContainerHeight={scrollContainerHeight}
        onAddRef={onAddRef}
        onEdit={onEdit}
      />
      <Layouts.Box position="relative" ref={onAddRef} backgroundColor="white">
        <Divider />
        <Layouts.Padding top="2" bottom="2" left="3" right="3">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={onClose}>{t(`${I18N_PATH}Cancel`)}</Button>
            <Button variant="primary" onClick={onEdit}>
              {t(`${I18N_PATH}Edit`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};
