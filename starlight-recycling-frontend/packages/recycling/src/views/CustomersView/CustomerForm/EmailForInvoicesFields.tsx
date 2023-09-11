import React, { memo } from 'react';
import { TextField, CheckBoxField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import Box from '@material-ui/core/Box';

export interface EmailForInvoicesFieldsProps {
  classes: {
    dividerMargin: string;
    aprTypeField: string;
  };
  sameAsMainContact: boolean;
}

export const EmailForInvoicesFields = memo<EmailForInvoicesFieldsProps>(
  ({ classes, sameAsMainContact }) => {
    return (
      <Box display="flex" flexDirection="column">
        <CheckBoxField name="sameAsMainContact" label={<Trans>Same as Main Contact Email</Trans>} />
        <div className={classes.dividerMargin} />
        <TextField
          type="email"
          name="emailForInvoices"
          label={<Trans>Email for invoices</Trans>}
          required={!sameAsMainContact}
          disabled={sameAsMainContact}
        />
      </Box>
    );
  },
);
