import React, { FC } from 'react';
import { defaults } from 'lodash-es';
import { TextField } from '@starlightpro/common';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Trans } from '../../../i18n';
import Divider from '@material-ui/core/Divider';
import PhonesField from '../../../components/FinalForm/PhonesField';
import { ContactPhoneType } from '../../../graphql/api';
import { CheckBoxField } from '@starlightpro/common';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiTextField-root': {
      marginBottom: theme.spacing(3),
    },
  },
  phones: {
    marginTop: theme.spacing(4),
  },
}));

const PHONE_TYPES = [
  ContactPhoneType.Main,
  ContactPhoneType.Home,
  ContactPhoneType.Work,
  ContactPhoneType.Cell,
  ContactPhoneType.Other,
];

const defaultFieldNameMapping = {
  firstName: 'firstName',
  lastName: 'lastName',
  title: 'title',
  email: 'email',
  phones: 'phones',
};

export interface ContactFormProps {
  showActive?: boolean;
  showIsMain?: boolean;
  fieldNameMapping?: typeof defaultFieldNameMapping;
  disabled?: boolean;
}

export const ContactForm: FC<ContactFormProps> = ({
  showActive,
  showIsMain,
  fieldNameMapping = {},
  disabled,
}) => {
  const classes = useStyles();

  const fieldNames = defaults(fieldNameMapping, defaultFieldNameMapping);

  return (
    <>
      <Box pt={3} mb={2} display="flex" flexDirection="column">
        {showActive && <CheckBoxField name="active" label={<Trans>Active</Trans>} />}
        <Box mt={2} display="flex">
          <Box mr={3}>
            <TextField
              disabled={disabled}
              fullWidth
              name={fieldNames.firstName}
              label={<Trans>First Name</Trans>}
              required
            />
            <TextField
              disabled={disabled}
              fullWidth
              name={fieldNames.lastName}
              label={<Trans>Last Name</Trans>}
              required
            />
          </Box>
          <Box>
            <TextField
              disabled={disabled}
              fullWidth
              name={fieldNames.title}
              label={<Trans>Title</Trans>}
            />
            <TextField
              disabled={disabled}
              type="email"
              fullWidth
              name={fieldNames.email}
              label={<Trans>E-mail</Trans>}
            />
          </Box>
        </Box>
        {showIsMain && (
          <CheckBoxField
            disabled={disabled}
            name="isMain"
            label={<Trans>Is Main Contact?</Trans>}
          />
        )}
      </Box>
      <Divider />
      <Box className={classes.phones}>
        <PhonesField
          disabled={disabled}
          name={fieldNames.phones}
          phoneTypes={PHONE_TYPES}
          min={1}
          firstNumberType={ContactPhoneType.Main}
          firstNumberRemovable
        />
      </Box>
    </>
  );
};

export default ContactForm;
