import React from 'react';
import { closeModal, openModal } from '@starlightpro/common/components/Modals';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { Trans } from '../../../i18n';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

export const showPopupNote = (caption: string, note: string) => {
  openModal({
    content: (
      <Box width={300} display="flex" flexDirection="column">
        <Box flex="1" p={3}>
          <Box mb={2} mt={1}>
            <Typography variant="h5">
              <Trans>Popup Note</Trans>
            </Typography>
            <Typography variant="caption">{caption}</Typography>
          </Box>
          <Typography variant="body2">{note}</Typography>
        </Box>
        <Divider />
        <Box p={2} display="flex" alignItems="center" justifyContent="center">
          <Button onClick={() => closeModal()} variant="contained" color="primary">
            <Trans>Ok</Trans>
          </Button>
        </Box>
      </Box>
    ),
  });
};
