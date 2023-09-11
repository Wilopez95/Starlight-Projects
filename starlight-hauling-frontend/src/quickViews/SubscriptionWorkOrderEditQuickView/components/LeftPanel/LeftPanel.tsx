/* eslint-disable no-negated-condition */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { Divider, LeftPanelTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

const I18N_PATH = 'quickViews.SubscriptionWorkOrderEditQuickView.components.LeftPanel.';

const LeftPanel: React.FC = () => {
  const { subscriptionStore, subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const oneTime = subscriptionOrder?.oneTime;

  const { t } = useTranslation();
  const fallback = t(`${I18N_PATH}None`);

  return (
    <LeftPanelTools.Panel>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item>
          <Typography variant="headerThree">
            {t(`${I18N_PATH}Subscription`)} {!oneTime ? t(`${I18N_PATH}Servicing`) : ''}{' '}
            {t(`${I18N_PATH}WorkOrder`)} #{subscriptionWorkOrder?.sequenceId}
          </Typography>
          <Layouts.Margin top="2">
            <Badge borderRadius={2} color={subscriptionWorkOrder?.statusColor}>
              {subscriptionWorkOrder?.statusLabel}
            </Badge>
          </Layouts.Margin>
        </LeftPanelTools.Item>
        <Divider />
        <LeftPanelTools.Item>
          <Typography color="secondary">{t(`${I18N_PATH}LineOfBusiness`)}</Typography>
          <LeftPanelTools.Subitem>{subscription?.businessLine.name}</LeftPanelTools.Subitem>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item>
          <Typography color="secondary">{t(`${I18N_PATH}ServiceArea`)}</Typography>
          <LeftPanelTools.Subitem>
            {subscription?.serviceArea?.name ?? fallback}
          </LeftPanelTools.Subitem>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item>
          <Typography color="secondary">{t(`${I18N_PATH}Customer`)}</Typography>
          <LeftPanelTools.Subitem>
            {subscriptionOrder?.customer?.name ?? fallback}
          </LeftPanelTools.Subitem>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item>
          <Typography color="secondary">{t(`${I18N_PATH}JobSiteAddress`)}</Typography>
          <LeftPanelTools.Subitem>
            {subscriptionOrder?.jobSiteAddress ?? fallback}
          </LeftPanelTools.Subitem>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item>
          <Typography color="secondary">{t(`${I18N_PATH}TaxDistrict`)}</Typography>
          <LeftPanelTools.Subitem>
            {subscription?.taxDistricts?.map(({ description }) => description).join(', ') ??
              fallback}
          </LeftPanelTools.Subitem>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
