import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(() => ({
  root: {},
  field: {
    display: 'inline-flex',
    width: 200,
  },
  input: {
    margin: 0,
  },
}));

export interface FilterSelectValueFieldProps {
  name: string;
  menuOptions: { label: string | React.ReactNode; value: any }[];
  max?: number;
}

export const FilterSelectValueField: FC<FilterSelectValueFieldProps> = () => {
  const classes = useStyles();

  return <Box className={classes.root}></Box>;
};

export default FilterSelectValueField;
