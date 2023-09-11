import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import {
  MultiSelectFilter,
  NumberRangeFilter,
  TableFilter,
  TableFilterConfig,
  ZipCodeFilter,
} from '@root/common/TableTools/TableFilter';
import { CustomerStatus, invoiceConstructionOptions, paymentTermsOptions } from '@root/consts';
import { useIsRecyclingFacilityBU, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType } from '@root/types';

import { ICustomerFilters } from '../../types';

const customerStateOptions = [
  { label: 'On Hold', value: CustomerStatus.onHold },
  { label: 'Inactive', value: CustomerStatus.inactive },
  { label: 'Active', value: CustomerStatus.active },
];

const I18N_PATH = 'pages.Customers.CustomersPage.';

const CustomerFilters: React.FC<ICustomerFilters> = ({ onApply }) => {
  const { brokerStore, customerGroupStore } = useStores();

  const { t } = useTranslation();
  const { currencySymbol } = useIntl();
  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const customerGroupOptions = useMemo(() => {
    const options = [
      {
        label: 'Commercial',
        value: CustomerGroupType.commercial,
      },
    ];

    if (isRecyclingFacilityBU) {
      options.push({
        label: 'Walk-up',
        value: CustomerGroupType.walkUp,
      });
    } else {
      options.push({
        label: 'Non-commercial',
        value: CustomerGroupType.nonCommercial,
      });
    }

    return options;
  }, [isRecyclingFacilityBU]);

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig label={t(`${I18N_PATH}State`)} filterByKey="filterByState">
        <MultiSelectFilter options={customerStateOptions} />
      </TableFilterConfig>
      {!isRecyclingFacilityBU ? (
        <TableFilterConfig label={t(`${I18N_PATH}Broker`)} filterByKey="filterByBrokers">
          <MultiSelectFilter
            searchable
            options={brokerStore.values.map(broker => ({
              label: broker.name,
              value: broker.id,
            }))}
          />
        </TableFilterConfig>
      ) : null}
      <TableFilterConfig label={t(`${I18N_PATH}CustomerGroup`)} filterByKey="filterByGroup">
        <MultiSelectFilter
          options={customerGroupStore.values.map(group => ({
            label: group.description,
            value: group.id,
          }))}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}CustomerType`)} filterByKey="filterByType">
        <MultiSelectFilter options={customerGroupOptions} />
      </TableFilterConfig>
      <TableFilterConfig
        label={t(`${I18N_PATH}InvoiceStructure`)}
        filterByKey="filterByInvoiceConstruction"
      >
        <MultiSelectFilter options={invoiceConstructionOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}ZipCode`)} filterByKey="filterByZipCodes">
        <ZipCodeFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}Balance`)} filterByKey="filterByBalance">
        <NumberRangeFilter
          fromNumberPropName="filterByBalanceFrom"
          toNumberPropName="filterByBalanceTo"
          unit={currencySymbol}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}PaymentTerms`)} filterByKey="filterByPaymentTerms">
        <MultiSelectFilter options={paymentTermsOptions} />
      </TableFilterConfig>
    </TableFilter>
  );
};

export default observer(CustomerFilters);
