import { Box, Button, Divider, makeStyles, Typography } from '@material-ui/core';
import { Trans, useTranslation } from '../../../../i18n';
import React, { FC, useCallback } from 'react';
import { openModal } from '@starlightpro/common/components/Modals';
import { useField } from 'react-final-form';
import { PdfPreviewModalContent } from './PdfPreviewModalContent';
import WeightTicketBigThumb from '../icons/WeightTicketBigThumb';
import { printDialog } from '../../../../utils/printDialog';
import { SendWeightTicketViaEmailModalContent } from './SendWeightTicketViaEmailModalContent';

interface CursorProps {
  thumbCursor: string;
}

const useStyles = makeStyles(
  (theme) => ({
    boldText: {
      fontWeight: 500,
      color: theme.palette.grey['900'],
    },
    weightTicket: (props: CursorProps) => ({
      width: 100,
      height: 100,
      cursor: props.thumbCursor,
    }),
  }),
  { name: 'WeightTicketField' },
);

export const WeightTicketField: FC = () => {
  const [t] = useTranslation();
  const {
    input: { value: weightTicketUrl },
  } = useField('weightTicketUrl', { subscription: { value: true } });
  const {
    input: { value: orderId },
  } = useField('orderId', { subscription: { value: true } });

  const classes = useStyles({ thumbCursor: weightTicketUrl ? 'pointer' : 'default' });

  const openPreviewWeightTicketModal = useCallback(() => {
    if (!weightTicketUrl) {
      return;
    }

    openModal({
      content: <PdfPreviewModalContent orderId={orderId} />,
    });
  }, [orderId, weightTicketUrl]);

  const openSendEmailModal = useCallback(() => {
    openModal({
      content: <SendWeightTicketViaEmailModalContent orderId={orderId} />,
      stacked: true,
    });
  }, [orderId]);

  const printPdf = useCallback(() => {
    printDialog({ url: weightTicketUrl });
  }, [weightTicketUrl]);

  return (
    <Box mt={2} mb={2}>
      <Typography variant="h6" className={classes.boldText}>
        <Trans>Weight ticket</Trans>
      </Typography>
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Box
          mr={2}
          mb={2}
          className={classes.weightTicket}
          onClick={openPreviewWeightTicketModal}
          title={t('Weight ticket')}
        >
          <WeightTicketBigThumb />
        </Box>
        <Box display="flex" alignItems="flex-end" mb={2}>
          <Box mr={2}>
            <Button
              variant="outlined"
              color="primary"
              disabled={!weightTicketUrl}
              onClick={openSendEmailModal}
            >
              <Trans>Send to email</Trans>
            </Button>
          </Box>

          <Button variant="outlined" color="primary" onClick={printPdf} disabled={!weightTicketUrl}>
            <Trans>Print</Trans>
          </Button>
          <Box ml={2}>
            <Button
              variant="outlined"
              color="primary"
              href={weightTicketUrl}
              target={'_blank'}
              disabled={!weightTicketUrl}
            >
              <Trans>Download</Trans>
            </Button>
          </Box>
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};
