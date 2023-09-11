import { Box, makeStyles, Typography } from '@material-ui/core';
import { CheckBoxField } from '@starlightpro/common';
import React, { FC } from 'react';
import { Trans } from '../../../../i18n';

const useStyles = makeStyles(
  ({ palette }) => ({
    boldText: {
      fontWeight: 500,
      color: palette.grey['900'],
    },
    numberTextField: {
      '& .MuiFormHelperText-root': {
        maxWidth: '175px',
      },
    },
  }),
  { name: 'PrintWeightTicketField' },
);

export const PrintWeightTicketField: FC = () => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" mt={2}>
      <Typography variant="body1" className={classes.boldText}>
        <Trans>Print weight ticket</Trans>
      </Typography>
      <Box display="flex" mt={2}>
        <CheckBoxField
          label={<Trans>Print weight ticket</Trans>}
          name="printWeightTicket"
          checked={true}
        />
      </Box>
    </Box>
  );
};
