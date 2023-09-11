import React, { FC, useMemo } from 'react';
import * as yup from 'yup';
import { Trans, useTranslation } from '../../../../i18n';
import { Field } from 'react-final-form';
import { TextField, CheckBoxField } from '@starlightpro/common';
import { omit } from 'lodash-es';

import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import AddressSearchField from '../../../../components/FinalForm/AddressSearchField';
import SidebarForm from '../../../../components/FinalForm/SidebarForm';
import AddressMapField from '../../../../components/FinalForm/AddressMapField';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import {
  updateSelectedHaulingLocationOnChange,
  valuesToSelectedHaulingLocation,
} from '../../../../components/FinalForm/decorators/updateSelectedHaulingLocationOnChange';
import { closeSidePanel } from '@starlightpro/common/components/SidePanels';
import { serverMessages } from '../../../../constants';
import { useRegion } from '../../../../hooks/useRegion';

const DestinationSchema = yup.object({
  active: yup.bool().required('Required'),
  description: yup
    .string()
    .max(100, 'Should be less then 100 characters')
    .trim()
    .required('Required'),
  searchAddress: yup.string(),
  addressLine1: yup
    .string()
    .max(200, 'Should be less than 200 characters')
    .trim()
    .nullable()
    .required('Required'),
  addressLine2: yup.string().max(200, 'Should be less than 200 characters').trim().nullable(),
  state: yup
    .string()
    .max(100, 'Should be less then 100 characters')
    .trim()
    .nullable()
    .required('Required'),
  city: yup
    .string()
    .max(100, 'Should be less then 100 characters')
    .trim()
    .nullable()
    .required('Required'),
  zip: yup
    .string()
    .max(50, 'Should be less then 50 characters')
    .trim()
    .nullable()
    .required('Required'),
  geojson: yup.object().required('Required'),
});

interface DestinationFormProps {
  create?: boolean;
  destination: any;
  onSubmit: (values?: any) => void;
  onSubmitted: (values?: any) => void;
  onCancel?: () => void;
}

const initialValues = {
  active: true,
  description: '',
  addressLine1: '',
  addressLine2: '',
  selectedLocation: null,
  state: '',
  city: '',
  zip: '',
  geojson: null,
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        marginBottom: theme.spacing(2),
      },
    },
    topDivider: {
      margin: theme.spacing(2, 0),
    },
    subtitle: {
      marginBottom: theme.spacing(1),
    },
    mapWrap: {
      flex: 1,
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    map: {
      height: '100%',
    },
    paper: {
      width: 708,
    },
  }),
);

export const DestinationForm: FC<DestinationFormProps> = ({
  create,
  destination,
  onCancel,
  onSubmit,
  onSubmitted,
}) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const { name: countryCode } = useRegion();

  const values = useMemo(() => {
    if (destination) {
      return {
        ...destination,
        selectedLocation: valuesToSelectedHaulingLocation(destination),
      };
    }

    return initialValues;
  }, [destination]);

  const decorator = useMemo(() => updateSelectedHaulingLocationOnChange(countryCode), [
    countryCode,
  ]);

  return (
    <SidebarForm
      create={create}
      decorators={[decorator]}
      initialValues={values}
      schema={DestinationSchema}
      cancelable
      title={
        <Field name="description" subscription={{ value: true }}>
          {({ input }) => (create ? t('Create New Destination') : input.value)}
        </Field>
      }
      classes={{
        paper: classes.paper,
      }}
      onCancel={() => {
        closeSidePanel();

        if (onCancel) {
          onCancel();
        }
      }}
      onSubmit={async (values) => {
        try {
          await onSubmit(omit(DestinationSchema.cast(values), ['__typename', 'selectedLocation']));
        } catch (e) {
          const errorMessage =
            serverMessages.errors.uniqEntity === e.message
              ? t('Destination with this description already exists')
              : e.message;
          throw new Error(errorMessage);
        }
      }}
      onSubmitted={onSubmitted}
    >
      <CloseConfirmationFormTracker />
      <Box display="flex">
        <Box flex={1}>
          <Box mb={1}>
            <CheckBoxField name="active" label={<Trans>Active</Trans>} />
          </Box>
          <TextField
            required
            fullWidth
            id="description"
            name="description"
            label={<Trans>Description</Trans>}
          />
          <Divider className={classes.topDivider} />

          <AddressSearchField
            label={<Trans>Search Address</Trans>}
            fullWidth
            name="selectedLocation"
          />

          <TextField
            id="addressLine1"
            name="addressLine1"
            label={<Trans>Address Line 1</Trans>}
            fullWidth
            required
          />
          <TextField
            id="addressLine2"
            name="addressLine2"
            label={<Trans>Address Line 2</Trans>}
            fullWidth
          />
          <TextField id="city" name="city" label={<Trans>City</Trans>} fullWidth required />
          <TextField id="state" name="state" label={<Trans>State</Trans>} fullWidth required />
          <TextField id="zip" name="zip" label={<Trans>ZIP</Trans>} fullWidth required />
        </Box>

        <AddressMapField
          name="selectedLocation"
          className={classes.map}
          wrapClassName={classes.mapWrap}
        />
      </Box>
    </SidebarForm>
  );
};

export default DestinationForm;
