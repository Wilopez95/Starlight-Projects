import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import {
  AppliedFilterState,
  MultiSelectFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { useCleanup, useCrudPermissions, useStores } from '@root/hooks';

interface ITruckFilters {
  onApply(filterState: AppliedFilterState): void;
}

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

const TruckFilters: React.FC<ITruckFilters> = ({ onApply }) => {
  const { businessUnitStore, truckTypeStore } = useStores();

  const { t } = useTranslation();

  const [canViewBusinessUnits] = useCrudPermissions('configuration', 'business-units');

  useCleanup(businessUnitStore);
  useCleanup(truckTypeStore);

  useEffect(() => {
    truckTypeStore.cleanup();
    truckTypeStore.requestAll({
      activeOnly: true,
    });

    if (canViewBusinessUnits) {
      businessUnitStore.request();
    }
  }, [businessUnitStore, canViewBusinessUnits, truckTypeStore]);

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig
        label={t(`${I18N_PATH}BusinessUnitOptions`)}
        filterByKey="filterByBusinessUnit"
      >
        <MultiSelectFilter
          options={businessUnitStore.values.map(({ id, nameLine1 }) => ({
            value: id,
            label: nameLine1,
          }))}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}TruckTypeOptions`)} filterByKey="filterByTruckType">
        <MultiSelectFilter
          options={truckTypeStore.values.map(({ id, description }) => ({
            label: description,
            value: id,
          }))}
        />
      </TableFilterConfig>
    </TableFilter>
  );
};

export default observer(TruckFilters);
