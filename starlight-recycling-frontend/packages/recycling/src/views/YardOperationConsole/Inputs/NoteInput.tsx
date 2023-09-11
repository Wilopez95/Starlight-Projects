import React from 'react';
import { TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { ReadOnlyOrderFormComponent } from '../types';

interface Props extends ReadOnlyOrderFormComponent {}

export const NoteInput: React.FC<Props> = ({ readOnly }) => {
  return (
    <TextField
      disabled={readOnly}
      id="note"
      name="note"
      label={<Trans>Note</Trans>}
      rows={4}
      multiline
      fullWidth
    />
  );
};
