import React, { FC, useCallback } from 'react';

import i18n from '../../../i18n';
import CommonFilter from '../CommonFilter';
import { CommonFilterBaseProps } from '../index';

const fieldOptions = [
  {
    label: i18n.t('State'),
    field: 'state',
  },
  {
    label: i18n.t('City'),
    field: 'city',
  },
  {
    label: i18n.t('ZIP'),
    field: 'zip',
  },
  {
    label: i18n.t('Tax district'),
    field: 'jobSiteTaxDistricts.taxDistrict.id',
  },
];

export interface JobSiteFilterProps extends CommonFilterBaseProps {}

export const JobSiteFilter: FC<JobSiteFilterProps> = ({ name }) => {
  const renderValue = useCallback((field: string) => {
    switch (field) {
      case 'state':
      case 'city':
      case 'zip':
        break;
      default:
        return null;
    }
  }, []);

  return <CommonFilter name={name} fieldOptions={fieldOptions} renderValue={renderValue} />;
};

export default JobSiteFilter;
