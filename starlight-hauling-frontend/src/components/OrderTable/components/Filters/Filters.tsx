import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  AppliedFilterState,
  DateRangeFilter,
  MultiSelectFilter,
  TableFilter,
  TableFilterConfig,
  YesNoFilter,
} from '@root/common/TableTools/TableFilter';
import { paymentTermsOptions } from '@root/consts';
import { materialToSelectOption } from '@root/helpers';
import { useCleanup, useCrudPermissions, useStores } from '@root/hooks';

interface IOrderFilters {
  onApply(filterState: AppliedFilterState): void;
}

const paymentMethodOptions: ISelectOption[] = [
  {
    label: 'Credit Card',
    value: 'creditCard',
  },
  { label: 'Cash', value: 'cash' },
  { label: 'Check', value: 'check' },
  {
    label: 'On Account',
    value: 'onAccount',
  },
  {
    label: 'No payment method',
    value: 'noPayment',
  },
];

const I18N_PATH = 'components.OrderTable.components.Filters.Text.';

const Filters: React.FC<IOrderFilters> = ({ onApply }) => {
  const {
    materialStore,
    businessLineStore,
    thirdPartyHaulerStore,
    userStore,
    brokerStore,
    billableServiceStore,
  } = useStores();

  const { t } = useTranslation();

  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');
  const [canViewThirdPartyHaulers] = useCrudPermissions('configuration', 'third-party-haulers');
  const [canViewBrokers] = useCrudPermissions('configuration', 'brokers');
  const [canViewUsers] = useCrudPermissions('configuration', 'users');
  const [canViewBillableItems] = useCrudPermissions('configuration', 'billable-items');

  useCleanup(materialStore);
  useCleanup(businessLineStore);
  useCleanup(thirdPartyHaulerStore);
  useCleanup(userStore);
  useCleanup(brokerStore);
  useCleanup(billableServiceStore);

  useEffect(() => {
    businessLineStore.request();

    if (canViewMaterials) {
      materialStore.request();
    }

    if (canViewThirdPartyHaulers) {
      thirdPartyHaulerStore.request();
    }

    if (canViewBillableItems) {
      billableServiceStore.request({});
    }

    if (canViewUsers) {
      userStore.request();
    }

    if (canViewBrokers) {
      brokerStore.request();
    }
  }, [
    billableServiceStore,
    brokerStore,
    businessLineStore,
    canViewBillableItems,
    canViewBrokers,
    canViewMaterials,
    canViewThirdPartyHaulers,
    canViewUsers,
    materialStore,
    thirdPartyHaulerStore,
    userStore,
  ]);

  return (
    <TableFilter onApply={onApply}>
      {canViewMaterials ? (
        <TableFilterConfig label={t(`${I18N_PATH}Materials`)} filterByKey="filterByMaterials">
          <MultiSelectFilter
            searchable
            options={[
              ...materialStore.values.map(materialToSelectOption),
              {
                label: 'Manifested Materials',
                value: 'manifested',
              },
            ]}
          />
        </TableFilterConfig>
      ) : null}
      <TableFilterConfig label={t(`${I18N_PATH}PaymentTerms`)} filterByKey="filterByPaymentTerms">
        <MultiSelectFilter searchable options={paymentTermsOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}PaymentMethod`)} filterByKey="filterByPaymentMethod">
        <MultiSelectFilter searchable options={paymentMethodOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}ServiceDate`)} filterByKey="filterByServiceDate">
        <DateRangeFilter
          fromDatePropName="filterByServiceDateFrom"
          toDatePropName="filterByServiceDateTo"
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}WeightTicket`)} filterByKey="filterByWeightTicket">
        <YesNoFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}BusinessLine`)} filterByKey="filterByBusinessLine">
        <MultiSelectFilter
          searchable
          options={businessLineStore.values.map(businessLine => ({
            label: businessLine?.name ?? '',
            value: businessLine.id,
          }))}
        />
      </TableFilterConfig>
      {canViewBrokers ? (
        <TableFilterConfig label={t(`${I18N_PATH}Broker`)} filterByKey="filterByBroker">
          <MultiSelectFilter
            searchable
            options={brokerStore.values.map(broker => ({
              label: broker?.name ?? '',
              value: broker.id,
            }))}
          />
        </TableFilterConfig>
      ) : null}
      {canViewUsers ? (
        <TableFilterConfig label={t(`${I18N_PATH}CSR`)} filterByKey="filterByCsr">
          <MultiSelectFilter
            searchable
            options={userStore.values.map(user => ({
              label: user?.name ?? '',
              value: user.name,
            }))}
          />
        </TableFilterConfig>
      ) : null}
      {canViewThirdPartyHaulers ? (
        <TableFilterConfig label={t(`${I18N_PATH}Hauler`)} filterByKey="filterByHauler">
          <MultiSelectFilter
            searchable
            options={thirdPartyHaulerStore.values.map(user => ({
              label: user.description,
              value: user.id,
            }))}
          />
        </TableFilterConfig>
      ) : null}
      {canViewBillableItems ? (
        <TableFilterConfig label={t(`${I18N_PATH}Service`)} filterByKey="filterByService">
          <MultiSelectFilter
            searchable
            options={billableServiceStore.values.map(user => ({
              label: user.description,
              value: user.id,
            }))}
          />
        </TableFilterConfig>
      ) : null}
    </TableFilter>
  );
};

export default observer(Filters);
