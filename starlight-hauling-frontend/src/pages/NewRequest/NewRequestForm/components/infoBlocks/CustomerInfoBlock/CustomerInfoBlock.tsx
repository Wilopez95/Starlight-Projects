import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ContactIcon } from '@root/assets';
import { Badge, DescriptiveTooltip, Typography } from '@root/common';
import { CustomerStatus } from '@root/consts';
import { isCore } from '@root/consts/env';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import InfoBlock from '../InfoBlock';

import { BalanceRow } from './styles';
import { ICustomerInfoBalanceItem, ICustomerInfoBlock } from './types';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.components.CustomerInfoBlock.Text.';

const balanceItems: ICustomerInfoBalanceItem[] = [
  {
    label: `${I18N_PATH}Balance`,
    key: 'balance',
    bold: true,
  },
  {
    label: `${I18N_PATH}AvailableCredit`,
    key: 'availableCredit',
    highlightNegativeValue: true,
  },
  {
    label: `${I18N_PATH}OrdersTotal`,
    key: 'ordersTotal',
    tooltip: isCore
      ? `${I18N_PATH}OrdersTotalTooltipAlternative`
      : `${I18N_PATH}OrdersTotalTooltip`,
  },
];

const CustomerInfoBlock: React.FC<ICustomerInfoBlock> = ({
  ordersTotal,
  readOnly = false,
  onClear,
}) => {
  const { customerStore, customerGroupStore } = useStores();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  useEffect(() => {
    customerGroupStore.request();
  }, [customerGroupStore, customerStore]);

  const selectedCustomer = customerStore.selectedEntity;
  const balances = selectedCustomer?.balances;
  const address = selectedCustomer?.mailingAddress;
  const balanceItemValues = { ...balances, ordersTotal };
  const onHoldBadge =
    selectedCustomer?.status !== CustomerStatus.active ? (
      <Layouts.Margin left="1">
        <Badge color="alert">
          {t(`Text.${selectedCustomer?.status === CustomerStatus.onHold ? 'OnHold' : 'Inactive'}`)}
        </Badge>
      </Layouts.Margin>
    ) : (
      ''
    );

  return (
    <InfoBlock
      firstBlock={{
        heading: (
          <Layouts.Flex>
            {selectedCustomer?.customerGroup?.description ?? ''} - ID {selectedCustomer?.id ?? ''}
            {onHoldBadge}
          </Layouts.Flex>
        ),
        headingId: selectedCustomer?.id,
        title: selectedCustomer?.name,
        lines: [`${address?.city ?? ''}, ${address?.state ?? ''} ${address?.zip ?? ''}`],
      }}
      secondBlock={{
        content: (
          <Layouts.Box>
            {balanceItems.map(balanceItem => {
              const value = balanceItemValues[balanceItem.key] ?? 0;

              return (
                <BalanceRow key={balanceItem.key}>
                  <Layouts.Flex>
                    <Layouts.Margin right="2">
                      <Layouts.Box width="120px">
                        <Typography
                          variant="bodyMedium"
                          color="secondary"
                          shade="desaturated"
                          textAlign="right"
                          fontWeight={balanceItem.bold ? 'semiBold' : 'normal'}
                        >
                          {t(balanceItem.label)}, $
                          {balanceItem.tooltip ? (
                            <Layouts.Margin left="1" as="span">
                              <DescriptiveTooltip
                                position="top"
                                text={balanceItem.tooltip ? t(balanceItem.tooltip) : null}
                              />
                            </Layouts.Margin>
                          ) : null}
                        </Typography>
                      </Layouts.Box>
                    </Layouts.Margin>

                    <Layouts.Box width="90px">
                      <Typography
                        variant="bodyMedium"
                        textAlign="right"
                        fontWeight={balanceItem.bold ? 'semiBold' : 'normal'}
                        color={
                          balanceItem.highlightNegativeValue && value < 0 ? 'alert' : 'default'
                        }
                      >
                        {formatCurrency(value)}
                      </Typography>
                    </Layouts.Box>
                  </Layouts.Flex>
                </BalanceRow>
              );
            })}
          </Layouts.Box>
        ),
      }}
      thirdBlock={
        readOnly
          ? undefined
          : {
              text: 'Select another customer',
              icon: ContactIcon,
              onClick: onClear,
            }
      }
    />
  );
};

export default observer(CustomerInfoBlock);
