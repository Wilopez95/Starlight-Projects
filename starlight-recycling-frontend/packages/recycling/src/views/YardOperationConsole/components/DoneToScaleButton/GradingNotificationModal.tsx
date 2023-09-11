import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Button, Divider, Typography } from '@material-ui/core';
import { closeModal } from '../../../../components/Modals';

interface Props {
  handleSubmit: () => void;
}

export const GradingNotificationModal: FC<Props> = ({ handleSubmit }) => {
  return (
    <Box width="440px">
      <Box p={4}>
        <Box mb={2} mt={1}>
          <Typography variant="h5">
            <Trans>Grading Materials</Trans>
          </Typography>
        </Box>
        <Trans>Sum of all materials is not equal to 100%. Are you sure you want to continue?</Trans>
      </Box>
      <Divider />
      <Box p={4} display="flex" justifyContent="space-between">
        <Button onClick={closeModal} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Proceed
        </Button>
      </Box>
    </Box>
  );
};
