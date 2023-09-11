import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  MultiSelectFilter,
  SingleInputFilter,
  TableFilter,
  TableFilterConfig,
  YesNoFilter,
  ZipCodeFilter,
} from '@root/common/TableTools/TableFilter';
import { useCrudPermissions, useStores } from '@root/hooks';

import { IJobSitesFilters } from './types';

const I18N_PATH = 'pages.JobSites.Text.';

export const JobSitesFilters: React.FC<IJobSitesFilters> = ({ onApply }) => {
  const { t } = useTranslation();
  const { taxDistrictStore, serviceAreaStore } = useStores();

  const [canViewServiceAreas] = useCrudPermissions('configuration', 'service-areas');

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig
        label={t(`${I18N_PATH}AlleyPlacement`)}
        filterByKey="filterByAlleyPlacement"
      >
        <YesNoFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}CabOver`)} filterByKey="filterByCabOver">
        <YesNoFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}TaxDistrict`)} filterByKey="filterByTaxDistrict">
        <MultiSelectFilter
          searchable
          options={taxDistrictStore.sortedValues.map(district => ({
            label: district.description,
            value: district.id,
          }))}
        />
      </TableFilterConfig>
      {canViewServiceAreas ? (
        <TableFilterConfig label={t(`${I18N_PATH}ServiceArea`)} filterByKey="filterByServiceArea">
          <MultiSelectFilter
            searchable
            options={serviceAreaStore.buValues?.map(serviceArea => ({
              label: serviceArea?.description,
              value: serviceArea.id,
            }))}
          />
        </TableFilterConfig>
      ) : null}
      <TableFilterConfig label={t(`${I18N_PATH}ZipCode`)} filterByKey="filterByZipCodes">
        <ZipCodeFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}City`)} filterByKey="filterByCity">
        <SingleInputFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}State`)} filterByKey="filterByState">
        <SingleInputFilter />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}Name`)} filterByKey="filterByName">
        <SingleInputFilter />
      </TableFilterConfig>
    </TableFilter>
  );
};
