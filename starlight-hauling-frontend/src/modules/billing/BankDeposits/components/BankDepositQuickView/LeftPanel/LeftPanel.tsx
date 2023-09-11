import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { lowerCase, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Badge, Typography } from '../../../../../../common';
import { LeftPanelTools } from '../../../../../../common/QuickView';
import { useStores } from '../../../../../../hooks';
import { BankDepositStatus, BankDepositType } from '../../../types';

const I18N_PATH = 'modules.billing.BankDeposits.components.BankDepositQuickView.LeftPanel.Text.';

const LeftPanel: React.FC = () => {
  const { bankDepositStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const { t } = useTranslation();

  const currentBankDeposit = bankDepositStore.selectedEntity;

  const total = currentBankDeposit?.total ?? 0;
  const adjustments = currentBankDeposit?.adjustments ?? 0;

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography variant="headerThree">{t(`${I18N_PATH}BankDeposit`)}</Typography>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Badge
              bgColor={currentBankDeposit?.status === BankDepositStatus.locked ? 'grey' : 'success'}
              bgShade={
                currentBankDeposit?.status === BankDepositStatus.locked ? 'standard' : 'desaturated'
              }
              color={
                currentBankDeposit?.status === BankDepositStatus.locked ? 'secondary' : 'success'
              }
              shade={currentBankDeposit?.status === BankDepositStatus.locked ? 'light' : 'standard'}
            >
              {startCase(lowerCase(currentBankDeposit?.status))}
            </Badge>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}DepositType`)}:
            </Typography>
            <LeftPanelTools.Subitem>
              {currentBankDeposit?.depositType === BankDepositType.cashCheck
                ? t(`Text.CashCheck`)
                : startCase(lowerCase(currentBankDeposit?.depositType))}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t('Text.Date')}:
            </Typography>
            <LeftPanelTools.Subitem>
              {currentBankDeposit?.date ? formatDateTime(currentBankDeposit.date).date : null}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}SyncedQuickBooks`)}
            </Typography>
            <LeftPanelTools.Subitem>
              {t(currentBankDeposit?.synced ? 'Text.Yes' : 'Text.No')}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>

      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}RecordsCount`)}:
          </Typography>
          <Typography>{currentBankDeposit?.payments?.length ?? 0}</Typography>
        </LeftPanelTools.Item>

        <LeftPanelTools.Item inline>
          <Typography fontWeight="bold" color="secondary" shade="desaturated">
            {t('Text.Total')}:
          </Typography>
          <Typography fontWeight="bold">{formatCurrency(total)}</Typography>
        </LeftPanelTools.Item>

        {currentBankDeposit?.depositType === BankDepositType.creditCard ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Adjustments`)}:
            </Typography>
            <Typography>{formatCurrency(adjustments)}</Typography>
          </LeftPanelTools.Item>
        ) : null}

        {currentBankDeposit?.depositType === BankDepositType.creditCard ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Net`)}:
            </Typography>
            <Typography>{formatCurrency(total + adjustments)}</Typography>
          </LeftPanelTools.Item>
        ) : null}
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
