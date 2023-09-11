import React from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PaymentTypeEnum } from '@root/api/base';
import {
  DateRangeFilter,
  MultiSelectFilter,
  NumberRangeFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IBaseFilterComponent } from '@root/types';

const paymentTypeOptions: ISelectOption[] = [
  {
    label: 'Cash',
    value: PaymentTypeEnum.cash,
  },
  {
    label: 'Check',
    value: PaymentTypeEnum.check,
  },
  {
    label: 'Credit card',
    value: PaymentTypeEnum.creditCard,
  },
  {
    label: 'Credit Memo',
    value: PaymentTypeEnum.creditMemo,
  },
  {
    label: 'Write Off',
    value: PaymentTypeEnum.writeOff,
  },
  {
    label: 'Refund on account',
    value: PaymentTypeEnum.refundOnAccount,
  },
];

const I18N_PATH = 'pages.CustomerPaymentsAndStatements.Text.';

const PaymentFilter: React.FC<IBaseFilterComponent> = ({ onApply }) => {
  const { userStore } = useStores();
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig label={t(`${I18N_PATH}CreationDate`)} filterByKey="filterByCreationDate">
        <DateRangeFilter
          fromDatePropName="filterByCreatedFrom"
          toDatePropName="filterByCreatedTo"
          isCreateDate
        />
      </TableFilterConfig>

      <TableFilterConfig label={t(`${I18N_PATH}PaymentType`)} filterByKey="filterByType">
        <MultiSelectFilter options={paymentTypeOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}Amount`)} filterByKey="filterByAmount">
        <NumberRangeFilter
          fromNumberPropName="filterByAmountFrom"
          toNumberPropName="filterByAmountTo"
          unit={currencySymbol}
        />
      </TableFilterConfig>

      <TableFilterConfig label={t(`${I18N_PATH}User`)} filterByKey="filterByUser">
        <MultiSelectFilter
          searchable
          options={userStore.values.map(user => ({
            label: user.name,
            value: user.id,
          }))}
        />
      </TableFilterConfig>
    </TableFilter>
  );
};

export default observer(PaymentFilter);
