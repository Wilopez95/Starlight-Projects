import React, { FC } from 'react';
import { FormSpy } from 'react-final-form';
import { TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import * as yup from 'yup';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';

export const CustomerNotesSchema = yup.object().shape({
  generalNotes: yup.string().max(65535, 'At most 65535 characters long'),
  popupNotes: yup.string().max(65535, 'At most 65535 characters long'),
});

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    paddingTop: spacing(3),
    flexDirection: 'column',
  },
  blockMargin: {},
}));

export interface CustomerNotesFormProps {
  classes?: {
    root: string;
    blockMargin: string;
  };
}

export const CustomerNotesForm: FC<CustomerNotesFormProps> = ({ classes: classesProp }) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <>
      <Box pt={3} display="flex" className={classes.root}>
        <TextField
          fullWidth
          multiline
          rows={4}
          name="generalNotes"
          label={<Trans>General note</Trans>}
          className={classes.blockMargin}
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          name="popupNotes"
          label={<Trans>Pop-up note</Trans>}
        />
      </Box>

      <FormSpy subscription={{ submitFailed: true, submitErrors: true }}>
        {({ submitFailed, submitErrors }) => {
          if (!submitFailed) {
            return null;
          }

          return Object.keys(submitErrors).map((key) => (
            <Typography color="error" key={key}>
              {submitErrors[key]}
            </Typography>
          ));
        }}
      </FormSpy>
    </>
  );
};
