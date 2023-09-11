import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '../../../../components/icons/Close';
import { closeModal } from '@starlightpro/common/components/Modals';
import { SendWeightTicketEmailForm } from './SendWeightTicketEmailForm';

const useStyles = makeStyles(
  (theme) => ({
    mainContent: {
      display: 'flex',
    },
    mainWrap: {
      minWidth: '400px',
      display: 'flex',
      flexDirection: 'column',
    },
    topWrap: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
    },
    infoBox: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
      display: 'flex',
    },
    serviceBox: {
      display: 'flex',
    },
  }),
  { name: 'PdfPreviewModalContent' },
);

interface SendWeightTicketViaEmailModalContentProps {
  orderId: number;
}

export const SendWeightTicketViaEmailModalContent: FC<SendWeightTicketViaEmailModalContentProps> = ({
  orderId,
}: SendWeightTicketViaEmailModalContentProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.mainWrap}>
      <Box className={classes.topWrap}>
        <Box className={classes.infoBox}>
          <Typography variant="h6">
            <Trans>Send Weight ticket to email</Trans>
          </Typography>
        </Box>
        <Box className={classes.serviceBox}>
          <IconButton aria-label="close" onClick={closeModal} size="medium">
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
      <Box className={classes.mainContent}>
        <SendWeightTicketEmailForm closeWeightTicketModal={closeModal} orderId={orderId} />
      </Box>
    </Box>
  );
};
