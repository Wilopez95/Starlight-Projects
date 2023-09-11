import React, { FC } from 'react';
import { RadioGroupField, RadioGroupItem } from '@starlightpro/common';

import { makeStyles } from '@material-ui/core/styles';
import { DatatableFilterDisplayProps } from '../../types';

const useStyles = makeStyles(
  () => ({
    radioGroup: {
      flexDirection: 'row',
    },
  }),
  {
    name: 'FilterRadio',
  },
);

export interface FilterRadioProps extends DatatableFilterDisplayProps {}

export const RadioField: FC<FilterRadioProps> = ({ name, column: { filterData } }) => {
  const classes = useStyles();

  return (
    <RadioGroupField name={`${name}.value`} classes={{ groupRoot: classes.radioGroup }}>
      {(filterData || []).map(({ label, value }) => (
        <RadioGroupItem key={value} color="primary" value={value} label={label} data-cy={label} />
      ))}
    </RadioGroupField>
  );
};

export default RadioField;
