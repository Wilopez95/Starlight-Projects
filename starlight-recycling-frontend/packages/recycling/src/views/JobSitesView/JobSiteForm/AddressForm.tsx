import React, { FC } from 'react';

import { Box } from '@material-ui/core';
import AddressSearchField from '../../../components/FinalForm/AddressSearchField';
import { Trans } from '../../../i18n';
import { TextField, CheckBoxField } from '@starlightpro/common';
import AddressMapField from '../../../components/FinalForm/AddressMapField/AddressMapField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export interface AddressFormProps {
  showActiveCheckbox?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapWrap: {
      flex: 1,
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    map: {
      height: '100%',
    },
  }),
);

export const AddressForm: FC<AddressFormProps> = ({ showActiveCheckbox, readOnly, disabled }) => {
  const classes = useStyles();

  return (
    <Box display="flex">
      <Box flex={1}>
        {showActiveCheckbox && (
          <Box mb={2}>
            <CheckBoxField
              name="active"
              label={<Trans>Active</Trans>}
              readOnly={readOnly}
              disabled={disabled}
            />
          </Box>
        )}

        {disabled ? (
          <TextField
            name="selectedLocation.text"
            label={<Trans>Search Address</Trans>}
            fullWidth
            required
            readonly={readOnly}
            disabled={disabled}
          />
        ) : (
          <AddressSearchField
            label={<Trans>Search Address</Trans>}
            fullWidth
            name="selectedLocation"
          />
        )}

        <TextField
          id="lineAddress1"
          name="lineAddress1"
          label={<Trans>Address Line 1</Trans>}
          fullWidth
          required
          readonly={readOnly}
          disabled={disabled}
        />
        <TextField
          id="lineAddress2"
          name="lineAddress2"
          label={<Trans>Address Line 2</Trans>}
          fullWidth
          readonly={readOnly}
          disabled={disabled}
        />
        <TextField
          id="city"
          name="city"
          label={<Trans>City</Trans>}
          fullWidth
          required
          readonly={readOnly}
          disabled={disabled}
        />
        <TextField
          id="state"
          name="state"
          label={<Trans>State</Trans>}
          fullWidth
          required
          readonly={readOnly}
          disabled={disabled}
        />
        <TextField
          id="zip"
          name="zip"
          label={<Trans>ZIP</Trans>}
          fullWidth
          required
          readonly={readOnly}
          disabled={disabled}
        />
      </Box>

      <AddressMapField
        name="selectedLocation"
        className={classes.map}
        wrapClassName={classes.mapWrap}
        readOnly={readOnly}
      />
    </Box>
  );
};

export default AddressForm;
