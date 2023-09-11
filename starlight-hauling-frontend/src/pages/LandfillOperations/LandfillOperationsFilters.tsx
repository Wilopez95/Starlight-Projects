import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DateRangeFilter,
  NumberRangeFilter,
  TableFilter,
  TableFilterConfig,
  TimeRangeFilter,
} from '@root/common/TableTools/TableFilter';

import { ILandfillOperationsFilters } from './types';

const I18N_PATH_TABLE = 'pages.LandfillOperations.table.Text.';

export const LandfillOperationsFilters: React.FC<ILandfillOperationsFilters> = ({ onApply }) => {
  const { t } = useTranslation();

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig label={t(`${I18N_PATH_TABLE}TimeIn`)} filterByKey="filterByTimeIn">
        <TimeRangeFilter fromTimePropName="filterByTimeInFrom" toTimePropName="filterByTimeInTo" />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH_TABLE}TimeOut`)} filterByKey="filterByTimeOut">
        <TimeRangeFilter
          fromTimePropName="filterByTimeOutFrom"
          toTimePropName="filterByTimeOutTo"
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH_TABLE}NetWeight`)} filterByKey="filterByNetWeight">
        <NumberRangeFilter
          fromNumberPropName="filterByNetWeightFrom"
          toNumberPropName="filterByNetWeightTo"
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH_TABLE}Date`)} filterByKey="filterByDate">
        <DateRangeFilter fromDatePropName="filterByDateFrom" toDatePropName="filterByDateTo" />
      </TableFilterConfig>
    </TableFilter>
  );
};
