import React from 'react';
import { truncate } from 'lodash/fp';
import { TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { Field } from 'react-final-form';
import { Grid, Typography, Box } from '@material-ui/core';
import { ReadOnlyOrderFormComponent } from '../types';
import { OrderMiscellaneousMaterialDistribution } from '../../../graphql/api';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  numberTextField: {
    '& input': { textAlign: 'right' },
  },
}));

interface Props extends ReadOnlyOrderFormComponent {}

export const MiscellaneousItemsInput: React.FC<Props> = ({ readOnly }) => {
  const classes = useStyles();

  return (
    <div>
      <Box display="flex" alignItems="center" pb={4} pt={1}>
        <Typography style={{ fontWeight: 500 }}>
          <Trans>Miscellaneous Items</Trans>
        </Typography>
      </Box>
      <Field<OrderMiscellaneousMaterialDistribution[]>
        name="miscellaneousMaterialsDistribution"
        subscription={{ value: true }}
      >
        {({ input }) => (
          <Box mt={1}>
            {input.value.map((item, index) => (
              <Grid container key={item.uuid}>
                <Grid item xs={9}>
                  <Box display="flex" alignItems="center" height="100%" pb={4} pt={1}>
                    <Typography variant="body2">
                      {truncate({ length: 26 }, item.material.description)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    className={classes.numberTextField}
                    disabled={readOnly}
                    name={`miscellaneousMaterialsDistribution[${index}].quantity`}
                    type="number"
                    InputProps={{ inputProps: { inputMode: 'numeric', min: 0 } }}
                    hideErrorText
                  />
                </Grid>
              </Grid>
            ))}
          </Box>
        )}
      </Field>
    </div>
  );
};
