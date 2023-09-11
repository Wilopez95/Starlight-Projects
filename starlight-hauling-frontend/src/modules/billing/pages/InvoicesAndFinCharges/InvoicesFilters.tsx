import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

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

import {
  commonStatusOptions,
  customerPaymentTypeOptions,
  invoiceAgeOptions,
  invoiceStatusOptions,
} from './filtersOptions';

const I18N_PATH = 'pages.Invoices.Text.';

const multiSelectOptions = [...commonStatusOptions, ...invoiceStatusOptions];

const InvoicesFilters: React.FC<IBaseFilterComponent> = ({ onApply }) => {
  const { userStore, businessLineStore } = useStores();
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig label={t(`${I18N_PATH}Status`)} filterByKey="filterByStatus">
        <MultiSelectFilter options={multiSelectOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}CustomerType`)} filterByKey="filterByCustomer">
        <MultiSelectFilter options={customerPaymentTypeOptions} />
      </TableFilterConfig>

      <TableFilterConfig label={t(`${I18N_PATH}InvoiceAge`)} filterByKey="filterByAge">
        <MultiSelectFilter options={invoiceAgeOptions} />
      </TableFilterConfig>

      <TableFilterConfig label={t(`${I18N_PATH}CreationDate`)} filterByKey="filterByCreationDate">
        <DateRangeFilter
          fromDatePropName="filterByCreatedFrom"
          toDatePropName="filterByCreatedTo"
          isCreateDate
        />
      </TableFilterConfig>

      <TableFilterConfig label={t(`${I18N_PATH}DueDate`)} filterByKey="filterByDueDate">
        <DateRangeFilter
          fromDatePropName="filterByDueDateFrom"
          toDatePropName="filterByDueDateTo"
        />
      </TableFilterConfig>

      <TableFilterConfig label={t(`${I18N_PATH}Amount`)} filterByKey="filterByAmount">
        <NumberRangeFilter
          fromNumberPropName="filterByAmountFrom"
          toNumberPropName="filterByAmountTo"
          unit={currencySymbol}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}Balance`)} filterByKey="filterByBalance">
        <NumberRangeFilter
          fromNumberPropName="filterByBalanceFrom"
          toNumberPropName="filterByBalanceTo"
          unit={currencySymbol}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}User`)} filterByKey="filterByUser">
        <MultiSelectFilter
          searchable
          options={userStore.values.map(user => ({
            label: user?.name,
            value: user.id,
          }))}
        />
      </TableFilterConfig>
      <TableFilterConfig
        label={t(`${I18N_PATH}LineOfBusiness`)}
        filterByKey="filterBusinessLineIds"
      >
        <MultiSelectFilter
          options={businessLineStore.values.map(user => ({
            label: user.name,
            value: user.id,
          }))}
        />
      </TableFilterConfig>
    </TableFilter>
  );
};

export default observer(InvoicesFilters);
