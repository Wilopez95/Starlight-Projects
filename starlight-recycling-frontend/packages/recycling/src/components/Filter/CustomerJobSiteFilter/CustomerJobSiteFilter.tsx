import React, { FC, useCallback } from 'react';
import { RadioGroupField, RadioGroupItem } from '@starlightpro/common';

import i18n, { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import CommonFilter from '../CommonFilter';
import { CommonFilterBaseProps } from '../index';

const useStyles = makeStyles(() => ({
  radioGroup: {
    flexDirection: 'row',
  },
}));

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
    label: i18n.t('Zip'),
    field: 'zip',
  },
  {
    label: i18n.t('PO Required'),
    field: 'PONumberRequired',
  },
  {
    label: i18n.t('Tax district'),
    field: 'jobSite.jobSiteTaxDistricts.taxDistrict.id',
  },
];

export interface CustomerJobSiteFilterProps extends CommonFilterBaseProps {}

export const CustomerJobSiteFilter: FC<CustomerJobSiteFilterProps> = ({ name }) => {
  const classes = useStyles();
  const valueName = `${name}.value`;

  const renderValue = useCallback(
    (field: string) => {
      switch (field) {
        case 'state':
        case 'city':
        case 'zip':
        case 'jobSite.jobSiteTaxDistricts.taxDistrict.id':
          return null;
        case 'PONumberRequired':
          return (
            <RadioGroupField name={valueName} classes={{ groupRoot: classes.radioGroup }}>
              <RadioGroupItem color="primary" value={'true'} label={<Trans>Yes</Trans>} />
              <RadioGroupItem color="primary" value={'false'} label={<Trans>No</Trans>} />
            </RadioGroupField>
          );
        default:
          return null;
      }
    },
    [classes.radioGroup, valueName],
  );

  return <CommonFilter name={name} fieldOptions={fieldOptions} renderValue={renderValue} />;
};

export default CustomerJobSiteFilter;
