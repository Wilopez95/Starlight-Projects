import { Trans } from '@starlightpro/common/i18n';
import React, { FC } from 'react';
import { Field } from 'react-final-form';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CustomerTrackLabelIcon from './CustomeTrackLabelIcon';
import { CustomerTruckTypes } from '@starlightpro/common/graphql/api';

export type CustomerTruckLabelType = {
  containerWeight?: number | null;
};

const useStyles = makeStyles(() =>
  createStyles({
    label: {
      display: 'inline',
    },
    icon: {
      position: 'absolute',
      right: 0,
    },
  }),
);

const CustomerTruckLabel: FC<CustomerTruckLabelType> = ({ containerWeight }) => {
  const classes = useStyles();

  return (
    <Field name={'customerTruck'} subscription={{ value: true }}>
      {({ input }) => {
        return (
          <div className={classes.label}>
            <Trans>Truck</Trans>
            <CustomerTrackLabelIcon
              className={classes.icon}
              isActive={
                input.value?.type === CustomerTruckTypes.Rolloff
                  ? !!input.value?.emptyWeight && !!containerWeight
                  : !!input.value?.emptyWeight
              }
            />
          </div>
        );
      }}
    </Field>
  );
};

export default CustomerTruckLabel;
