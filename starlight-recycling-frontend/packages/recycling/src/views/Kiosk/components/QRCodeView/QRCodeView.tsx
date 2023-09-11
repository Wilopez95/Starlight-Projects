import React, { useMemo } from 'react';
import QRCode from 'qrcode.react';

import { Box, Typography, makeStyles } from '@material-ui/core';
import { RouteProps } from 'react-router';
import { useTranslation } from '../../../../i18n';

const useStyles = makeStyles(() => ({
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const QRCodeView = (props: RouteProps) => {
  const searchParams = props?.location?.search || '';
  const selfServiceUrl = new URLSearchParams(searchParams).get('value') || '';
  const classes = useStyles();
  const { t } = useTranslation();

  const isCorrectLink = useMemo(() => {
    const selfServiceFlowRegex = /(.*\/){1}(recycling\/){1}\d+\/(kiosk\/){1}(scales\/){1}\d+$/;
    const expectedValueProps = selfServiceFlowRegex.test(selfServiceUrl);

    return expectedValueProps;
  }, [selfServiceUrl]);

  return (
    <Box className={classes.root}>
      {isCorrectLink ? (
        <QRCode size={500} value={`${origin}/${selfServiceUrl}`} />
      ) : (
        <Typography variant="h1" color="error">
          {t('Provided link is incorrect')}
        </Typography>
      )}
    </Box>
  );
};
