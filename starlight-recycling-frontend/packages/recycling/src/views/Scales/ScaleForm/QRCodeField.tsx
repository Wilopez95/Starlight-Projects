import React, { FC, useMemo, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Tooltip } from '@material-ui/core';

import { useTranslation } from '../../../i18n';
import { CopyIcon } from '../../../components/icons/CopyIcon';
import { palette } from '../../../theme/palette';
import { useGetUserInfoQuery } from '../../../graphql/api';

const useStyles = makeStyles(
  ({ spacing }) => ({
    root: {
      display: 'flex',
      marginTop: spacing(1),
      marginBottom: spacing(2),
    },
    QRCodeLabel: {
      flex: 1,
    },
    QRCodeSection: {
      flex: 1,
      display: 'flex',
      flexFlow: 'column',
      wordBreak: 'break-all',
    },
    QRCodeLink: {
      display: 'flex',
      alignItems: 'center',
      color: palette.blue,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: spacing(1),
      marginBottom: spacing(2),
    },
    CopyIcon: {
      transform: 'scale(1.5)',
      transformOrigin: 'left top',
      marginRight: spacing(1),
    },
    TextCopied: {
      marginTop: '-3px',
      marginLeft: '3px',
    },
  }),
  { name: 'QRCodeField' },
);

export interface QRCodeFieldProps {
  scaleId?: number;
}

export const QRCodeField: FC<QRCodeFieldProps> = ({ scaleId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data } = useGetUserInfoQuery();
  const [hintTooltipOpen, setHintTooltipOpen] = useState(false);

  const qrCodeUrl = useMemo(() => {
    const resource = data?.userInfo?.resource || '';
    const selfServiceUrl = resource
      .replace('srn:', '')
      .split(':')
      .join('/')
      .concat(`/kiosk/scales/${scaleId}`);

    const url = `${process.env.RECYCLING_FE_URL}/qr?value=${selfServiceUrl}`;

    return url;
  }, [data?.userInfo?.resource, scaleId]);

  const copyOnClick = () => {
    navigator.clipboard.writeText(qrCodeUrl);
    setHintTooltipOpen(true);
    setTimeout(() => setHintTooltipOpen(false), 300);
  };

  return (
    <Box className={classes.root}>
      <Typography variant="body2" color="textSecondary" className={classes.QRCodeLabel}>
        {t('QR Code')}
      </Typography>
      <Box className={classes.QRCodeSection}>
        <Typography>{qrCodeUrl}</Typography>
        <Box className={classes.QRCodeLink} onClick={copyOnClick}>
          <Box className={classes.TextCopied}>
            <CopyIcon className={classes.CopyIcon} />
          </Box>
          <Tooltip
            title={t(`Link Copied`)!}
            placement={'bottom-end'}
            open={hintTooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Typography variant="body2">{t('Copy Link')}</Typography>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};
