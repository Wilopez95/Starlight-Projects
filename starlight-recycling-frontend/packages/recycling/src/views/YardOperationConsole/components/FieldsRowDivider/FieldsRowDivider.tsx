import { Divider, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';

const useStyles = makeStyles(
  ({ spacing }) => ({
    fieldsRowDivider: {
      marginTop: spacing(1),
      marginBottom: spacing(2),
    },
  }),
  { name: 'FieldsRowDivider' },
);

export const FieldsRowDivider: FC = () => {
  const classes = useStyles();

  return <Divider className={classes.fieldsRowDivider} />;
};
