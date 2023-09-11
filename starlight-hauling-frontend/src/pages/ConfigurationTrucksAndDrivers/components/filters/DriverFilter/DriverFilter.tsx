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

interface IDriverFilters {
  onApply(filterState: AppliedFilterState): void;
}

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

const DriverFilters: React.FC<IDriverFilters> = ({ onApply }) => {
  const { businessUnitStore, driverStore } = useStores();

  const { t } = useTranslation();

  const [canViewBusinessUnits] = useCrudPermissions('configuration', 'business-units');

  useCleanup(businessUnitStore);
  useCleanup(driverStore);

  useEffect(() => {
    if (canViewBusinessUnits) {
      businessUnitStore.request();
    }
  }, [businessUnitStore, canViewBusinessUnits, driverStore]);

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
    </TableFilter>
  );
};

export default observer(DriverFilters);
