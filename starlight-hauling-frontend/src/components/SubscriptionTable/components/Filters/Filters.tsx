import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useFormatFrequency } from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import {
  DateRangeFilter,
  MultiSelectFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { BillingCycleEnum } from '@root/consts';
import { IFrequency } from '@root/types/entities/frequency';
import { useStores } from '@hooks';

import { ISubscriptionFilters } from './types';

const I18N_PATH = 'components.SubscriptionTable.components.Filters.Text.';

const Filters: React.FC<ISubscriptionFilters> = ({ relatedStore, onApply }) => {
  const { businessLineStore } = useStores();
  const {
    subscriptionsFilters: { businessLine, serviceFrequency, billingCycle },
  } = relatedStore;

  const formatFrequency = useFormatFrequency();
  const { t } = useTranslation();

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  const businessLineOptions = useMemo(
    () =>
      businessLine?.reduce((options: ISelectOption[], businessLineId: number) => {
        const businessLineData = businessLineStore.values.find(
          businessLineInfo => businessLineInfo.id === businessLineId,
        );

        return businessLineData
          ? [
              ...options,
              {
                label: businessLineData?.name ?? '',
                value: businessLineData.id,
              },
            ]
          : options;
      }, []) ?? [],
    [businessLine, businessLineStore.values],
  );

  const frequencyOptions: ISelectOption[] = useMemo(
    () =>
      serviceFrequency
        ?.map((frequency: IFrequency) => ({
          label: formatFrequency(frequency),
          value: frequency.id,
        }))
        .sort((freq, nextFreq) => freq.label.localeCompare(nextFreq.label)) ?? [],
    [serviceFrequency, formatFrequency],
  );

  const billingCycleOptions: ISelectOption[] = useMemo(
    () =>
      billingCycle?.map((billingCycleData: BillingCycleEnum) => ({
        label: startCase(billingCycleData),
        value: billingCycle.toString(),
      })) ?? [],
    [billingCycle],
  );

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig label={t(`${I18N_PATH}StartDate`)} filterByKey="startDate">
        <DateRangeFilter fromDatePropName="startDateFrom" toDatePropName="startDateTo" />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}LinesOfBusiness`)} filterByKey="businessLine">
        <MultiSelectFilter searchable options={businessLineOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}ServiceFrequency`)} filterByKey="serviceFrequencyId">
        <MultiSelectFilter searchable options={frequencyOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}BillingCycle`)} filterByKey="billingCycle">
        <MultiSelectFilter searchable options={billingCycleOptions} />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}RatesChanged`)} filterByKey="ratesChanged">
        <MultiSelectFilter options={[]} />
      </TableFilterConfig>
    </TableFilter>
  );
};

export default observer(Filters);
