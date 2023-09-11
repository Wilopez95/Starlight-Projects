import React, { FC } from 'react';
import { truncate } from 'lodash/fp';
import { TextField } from '@starlightpro/common';
import CommonTextField from '@starlightpro/common/components/TextField';
import { Trans, useTranslation } from '../../../i18n';
import { Field } from 'react-final-form';
import { Grid, Typography, Box, makeStyles, Tooltip } from '@material-ui/core';

import { useField } from 'react-final-form';
import HelpIcon from '@material-ui/icons/HelpOutline';
import { TFunction } from 'i18next';
import { ReadOnlyOrderFormComponent } from '../types';
import { OrderMaterialDistribution } from '../../../graphql/api';

const useStyles = makeStyles(
  ({ palette, spacing }) => ({
    helpIcon: {
      marginLeft: spacing(1),
      color: palette.grey[400],
    },
    totalField: {
      '& input': { textAlign: 'right' },
      background: palette.grey[50],
    },
    numberTextField: {
      '& input': { textAlign: 'right' },
    },
  }),
  { name: 'MaterialDistributionInput' },
);

interface MaterialDistributionTotalProps {
  t: TFunction;
  classes: Record<'helpIcon' | 'totalField', string>;
}

export const MaterialDistributionTotal: FC<MaterialDistributionTotalProps> = ({ t, classes }) => {
  const {
    input: { value: gradingNotification },
  } = useField('gradingNotification', { subscription: { value: true } });
  const {
    input: { value: materialsDistributionTotal },
    meta: { error: materialsDistributionTotalError },
  } = useField('materialsDistributionTotal', { subscription: { value: true, error: true } });
  const gradingNotificationError = gradingNotification && materialsDistributionTotal !== 100;

  return (
    <Grid container>
      <Grid item xs={9}>
        <Box display="flex" alignItems="center" height="100%" pb={4} pt={1}>
          <Typography variant="body2" style={{ fontWeight: 500 }}>
            <Trans>Total</Trans>
          </Typography>
          {(materialsDistributionTotalError || gradingNotificationError) && (
            <Tooltip title={t('Sum of all Materials Must be Equal 100%') as string} placement="top">
              <HelpIcon className={classes.helpIcon} fontSize="small" />
            </Tooltip>
          )}
        </Box>
      </Grid>
      <Grid item xs={3}>
        <CommonTextField
          value={materialsDistributionTotal}
          readonly
          touched
          hideErrorText
          error={materialsDistributionTotalError || gradingNotificationError}
          warning={!materialsDistributionTotalError && gradingNotificationError}
          classes={{
            formControl: classes.totalField,
          }}
        />
      </Grid>
    </Grid>
  );
};

interface Props extends ReadOnlyOrderFormComponent {}

export const MaterialDistributionInput: React.FC<Props> = ({ readOnly }) => {
  const classes = useStyles();
  const [t] = useTranslation();

  return (
    <div>
      <Grid container>
        <Grid item xs={9}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            height="100%"
            pb={4}
            pt={1}
          >
            <Box display="flex" alignItems="center">
              <Typography style={{ fontWeight: 500 }}>
                <Trans>Material</Trans>, %
              </Typography>
              <Tooltip
                title={t('Sum of all Materials Must be Equal 100%') as string}
                placement="top"
              >
                <HelpIcon className={classes.helpIcon} fontSize="small" />
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Field<OrderMaterialDistribution[]>
        name="materialsDistribution"
        subscription={{ value: true }}
      >
        {({ input }) => (
          <Box mt={1}>
            {input.value.map((materialDistribution, index) => (
              <Grid container key={materialDistribution.uuid}>
                <Grid item xs={9}>
                  <Box display="flex" alignItems="center" height="100%" pb={4} pt={1}>
                    <Typography variant="body2">
                      {truncate({ length: 26 }, materialDistribution.material?.description || '')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    disabled={readOnly}
                    className={classes.numberTextField}
                    name={`materialsDistribution[${index}].value`}
                    hideErrorText={true}
                    type="number"
                    InputProps={{ inputProps: { inputMode: 'numeric', min: 0 } }}
                  />
                </Grid>
              </Grid>
            ))}
            <MaterialDistributionTotal t={t} classes={classes} />
          </Box>
        )}
      </Field>
    </div>
  );
};
