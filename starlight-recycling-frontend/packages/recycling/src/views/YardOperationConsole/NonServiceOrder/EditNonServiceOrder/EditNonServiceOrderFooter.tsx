import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Button, Divider, makeStyles } from '@material-ui/core';

import { Field } from 'react-final-form';
import { OrderStatus } from '../../../../graphql/api';
import { SaveButton } from '../../components/SaveButton';
import { closeSidePanel } from '../../../../components/SidePanels';
import { ReadOnlyOrderFormComponent } from '../../types';
import { ApproveOrderButton } from '../../components/ApproveOrderButton';
import { FinalizeOrderButton } from '../../components/FinalizeOrderButton';

const useStyles = makeStyles(({ spacing }) => ({
  footer: {
    padding: spacing(0, 4, 3, 4),
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  rightActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
  leftActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
}));

interface Props extends ReadOnlyOrderFormComponent {}

export const EditNonServiceOrderFooter: FC<Props> = ({ readOnly }) => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <Button variant="outlined" color="primary" onClick={closeSidePanel}>
            {!readOnly && <Trans>Cancel</Trans>}
            {readOnly && <Trans>Close</Trans>}
          </Button>
          {!readOnly && <SaveButton nonServiceOrder />}
        </Box>
        {!readOnly && (
          <Field name="status" subscription={{ initial: true }}>
            {({ meta: { initial: status } }) =>
              status === OrderStatus.Completed ? <ApproveOrderButton /> : <FinalizeOrderButton />
            }
          </Field>
        )}
      </Box>
    </Box>
  );
};
