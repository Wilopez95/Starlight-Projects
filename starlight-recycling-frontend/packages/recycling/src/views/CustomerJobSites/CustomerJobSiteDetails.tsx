import React, { FC } from 'react';
import { TextField, CheckBoxField } from '@starlightpro/common';
import { Trans } from '../../i18n';
import { Box } from '@material-ui/core';

export interface CustomerJobSiteDetailsProps {
  poReadonly?: boolean;
  hideStatus?: boolean;
}

export const CustomerJobSiteDetails: FC<CustomerJobSiteDetailsProps> = ({
  poReadonly,
  hideStatus,
}) => {
  return (
    <Box>
      <Box>
        {!hideStatus && <CheckBoxField name="active" label={<Trans>Active</Trans>} />}
        <CheckBoxField
          disabled={poReadonly}
          name="PONumberRequired"
          label={<Trans>PO # Required</Trans>}
        />
      </Box>
      <TextField
        multiline
        fullWidth
        rows={4}
        id="popupNote"
        name="popupNote"
        label={<Trans>Pop-up Note</Trans>}
      />
    </Box>
  );
};

export default CustomerJobSiteDetails;
