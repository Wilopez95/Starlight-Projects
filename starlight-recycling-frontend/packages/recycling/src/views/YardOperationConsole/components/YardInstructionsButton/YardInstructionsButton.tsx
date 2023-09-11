import React from 'react';
import { Trans } from '../../../../i18n';
import { Button, darken, makeStyles } from '@material-ui/core';
import { InstructionsModal } from './InstructionsModal';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';

const useStyles = makeStyles(({ palette }) => ({
  yardInstuctionsButton: {
    backgroundColor: palette.yellow,
    '&:hover': {
      backgroundColor: darken(palette.yellow, 0.1),
    },
  },
}));

export const YardInstructionsButton = () => {
  const classes = useStyles();
  const [openForm] = useOpenFormWithCloseConfirmation({ modal: true });

  return (
    <Button
      className={classes.yardInstuctionsButton}
      onClick={() => openForm({ form: <InstructionsModal /> })}
      startIcon={<InfoOutlinedIcon />}
      fullWidth
    >
      <Trans>Yard Instructions</Trans>
    </Button>
  );
};
