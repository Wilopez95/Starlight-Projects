import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../common';
import { LeftPanelTools } from '../../../../../../common/QuickView';
import { Divider } from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';

const I18N_PATH = 'modules.billing.Settlements.components.SettlementQuickView.LeftPanel.Text.';

const LeftPanel: React.FC<{ unconfirmedCount: number; unconfirmedTotal: number }> = ({
  unconfirmedCount,
  unconfirmedTotal,
}) => {
  const { settlementStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const { t } = useTranslation();

  const currentSettlement = settlementStore.selectedEntity;

  if (!currentSettlement) {
    return null;
  }

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}CardProcessor`)}:
            </Typography>
            <LeftPanelTools.Subitem>
              {startCase(currentSettlement.paymentGateway)}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t('Text.Date')}:
            </Typography>
            <LeftPanelTools.Subitem>
              {formatDateTime(currentSettlement.date).date}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}UnconfirmedRecords`)}:
          </Typography>
          <Typography>{unconfirmedCount}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography fontWeight="bold" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}UnconfirmedTotal`)}:
          </Typography>
          <Typography fontWeight="bold">{formatCurrency(unconfirmedTotal)}</Typography>
        </LeftPanelTools.Item>
        <Divider />

        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}SettledRecords`)}:
          </Typography>
          <Typography>{currentSettlement.count}</Typography>
        </LeftPanelTools.Item>

        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Fees`)}:
          </Typography>
          <Typography>{formatCurrency(currentSettlement.fees)}</Typography>
        </LeftPanelTools.Item>

        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Adjustments`)}:
          </Typography>
          <Typography>{formatCurrency(currentSettlement.adjustments)}</Typography>
        </LeftPanelTools.Item>

        <LeftPanelTools.Item inline>
          <Typography fontWeight="bold" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}SettlementTotal`)}:
          </Typography>
          <Typography fontWeight="bold">
            {formatCurrency(
              currentSettlement.adjustments + currentSettlement.fees + currentSettlement.amount,
            )}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
