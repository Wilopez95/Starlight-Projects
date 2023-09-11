import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { Trans, useTranslation } from '../../../../i18n';
import React, { FC, useCallback, useMemo } from 'react';
import { closeModal, openModal } from '@starlightpro/common/components/Modals';
import IconButton from '@material-ui/core/IconButton';
import Skeleton from '@material-ui/lab/Skeleton';
import CloseIcon from '../../../../components/icons/Close';
import { useGetOrderWeightTicketQuery } from '../../../../graphql/api';
import { PdfViewer } from '../PdfViewer';
import { SendWeightTicketViaEmailModalContent } from './SendWeightTicketViaEmailModalContent';
import gql from 'graphql-tag';

const useStyles = makeStyles(
  (theme) => ({
    scrollableContent: {
      overflow: 'scroll',
      height: '100%',
      maxHeight: '70vh',
      padding: theme.spacing(2),
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
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      marginBottom: theme.spacing(1),
    },
    infoBox: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
    },
    serviceBox: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '100px',
    },
  }),
  { name: 'PdfPreviewModalContent' },
);

interface PdfPreviewModalContentProps {
  orderId: number;
}

gql`
  query getOrderWeightTicket($orderId: Int!) {
    orderIndexed(id: $orderId) {
      hasWeightTicket
    }
    order(id: $orderId) {
      id
      weightTicketCreator {
        firstName
        lastName
      }
      weightTicketAttachedAt
      weightTicketUrl
    }
  }
`;

export const PdfPreviewModalContent: FC<PdfPreviewModalContentProps> = ({
  orderId,
}: PdfPreviewModalContentProps) => {
  const [t] = useTranslation();
  const classes = useStyles();
  const openSendEmailModal = useCallback(() => {
    openModal({
      content: <SendWeightTicketViaEmailModalContent orderId={orderId} />,
      stacked: true,
    });
  }, [orderId]);
  const { data: response, loading } = useGetOrderWeightTicketQuery({
    variables: {
      orderId,
    },
  });
  const weightTicketUrl = response?.order.weightTicketUrl;
  const weightTicketCreator = response?.order.weightTicketCreator;
  const weightTicketAttachedAt = response?.order.weightTicketAttachedAt;

  const isImg = useMemo(() => {
    if (!weightTicketUrl) {
      return false;
    }

    return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(new URL(weightTicketUrl).pathname);
  }, [weightTicketUrl]);

  const isPdf = useMemo(() => {
    if (!weightTicketUrl) {
      return false;
    }

    return /\.pdf$/i.test(new URL(weightTicketUrl).pathname);
  }, [weightTicketUrl]);

  if (loading) {
    return (
      <Box className={classes.mainWrap}>
        <Box className={classes.topWrap}>
          <Box className={classes.infoBox}>
            <Box display="flex">
              <Typography variant="h5">
                <Skeleton width="6rem" variant="text" />
              </Typography>
            </Box>
            <Box display="flex" mt={1}>
              <Typography variant="subtitle2">
                <Skeleton width="12rem" variant="text" />
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="subtitle2">
                <Skeleton width="6rem" variant="text" />
              </Typography>
            </Box>
          </Box>
          <Box className={classes.serviceBox}></Box>
        </Box>
        <Box className={classes.scrollableContent}>
          <Skeleton variant="rect" width="40rem" height="40rem" />
        </Box>
      </Box>
    );
  }

  if (!weightTicketUrl) {
    return (
      <Box className={classes.mainWrap}>
        <Box className={classes.topWrap}>
          <Box className={classes.infoBox}>
            <Box display="flex">
              <Typography variant="h5"></Typography>
            </Box>
            <Box display="flex" mt={1}>
              <Typography variant="subtitle2"></Typography>
            </Box>
            <Box display="flex">
              <Typography variant="subtitle2"></Typography>
            </Box>
          </Box>
          <Box className={classes.serviceBox}>
            <Box display="flex" justifyContent="flex-end" width="100%">
              <IconButton aria-label="close" onClick={closeModal} size="medium">
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Box className={classes.scrollableContent}>
          <Typography variant="h5">
            <Trans>No Weight Ticket</Trans>
          </Typography>
        </Box>
      </Box>
    );
  }

  let attachedBy = [weightTicketCreator?.firstName, weightTicketCreator?.lastName].join(' ');

  if (attachedBy.length === 1) {
    attachedBy = t('unknown');
  }

  return (
    <Box className={classes.mainWrap}>
      <Box className={classes.topWrap}>
        <Box className={classes.infoBox}>
          <Box display="flex">
            <Typography variant="h5">{t('Ticket# {{orderId}}', { orderId })}</Typography>
          </Box>
          <Box display="flex" mt={1}>
            <Typography variant="subtitle2">
              <Trans>Attached by</Trans>: {attachedBy}
            </Typography>
          </Box>
          <Box display="flex">
            <Typography variant="subtitle2">
              {t('dateTime', {
                value: weightTicketAttachedAt,
              })}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.serviceBox}>
          <Box display="flex" justifyContent="flex-end" width="100%">
            <IconButton aria-label="close" onClick={closeModal} size="medium">
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <Box>
              <Button
                variant="outlined"
                color="primary"
                target={'blank'}
                href={weightTicketUrl}
                disabled={!weightTicketUrl}
              >
                <Trans>Download</Trans>
              </Button>
            </Box>
            <Box ml={2} mr={2}>
              <Button
                variant="outlined"
                color="primary"
                disabled={!weightTicketUrl}
                onClick={openSendEmailModal}
              >
                <Trans>Send to email</Trans>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className={classes.scrollableContent}>
        {isImg ? (
          <img src={weightTicketUrl} alt="weight ticket" />
        ) : isPdf ? (
          <PdfViewer url={weightTicketUrl} />
        ) : (
          <Trans>Invalid format</Trans>
        )}
      </Box>
    </Box>
  );
};
