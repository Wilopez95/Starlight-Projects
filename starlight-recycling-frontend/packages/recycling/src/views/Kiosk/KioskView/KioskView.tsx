import React from 'react';
import { useHistory } from 'react-router-dom';
import { Box, makeStyles } from '@material-ui/core';
import { PoweredBy } from '@starlightpro/common';
import { FullTruckToScaleButtonBase } from '../../YardOperationConsole/components/FullTruckToScaleButton';
import { Paths, pathToUrl } from '../../../routes';
import { useParams } from 'react-router';
import { ParamsKeys } from '../../../routes/Params';
import { GeneralKioskView } from '../components';
import { useIsSelfServiceAvailable } from '../hooks/useIsSelfServiceAvailable';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from '../../../i18n';
import { useGetUserInfoQuery } from '../../../graphql/api';

const useStyles = makeStyles(({ spacing, palette, breakpoints }) => ({
  poweredBy: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    '& svg': {
      height: 18,
      marginLeft: spacing(2),
      marginBottom: spacing(0.5),
    },
    [breakpoints.up('md')]: {
      marginBottom: spacing(10),
    },
  },
  root: {
    '& div[class*="footer"]': {
      boxShadow: 'unset',
      display: 'flex',
    },
  },
  instructionText: {
    fontSize: '2rem',
  },
  instruction: {
    backgroundColor: palette.yellow,
    marginBottom: '20px',
  },
}));

export const KioskView = () => {
  const [t] = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const { scaleId } = useParams<ParamsKeys>();
  const { data: userData } = useGetUserInfoQuery();

  const onClick = () => {
    const route = pathToUrl(Paths.KioskModule.SelfService, {
      scaleId,
    });

    history.push(route);
  };
  const data = useIsSelfServiceAvailable();

  if (!data) {
    return null;
  }

  return (
    <GeneralKioskView
      className={classes.root}
      footer={
        <Box className={classes.poweredBy}>
          <PoweredBy />
        </Box>
      }
    >
      <>
        <Box mb={5}>
          <Typography variant="h4">
            {t('Welcome')}, <br />
            <b>{userData?.userInfo.firstName}</b>
          </Typography>
        </Box>
        {!data.isSelfServiceAvailable && (
          <Box p={2} className={classes.instruction}>
            <Typography className={classes.instructionText} variant="body1">
              {t(
                'The self-service is available only during working hours at {{startTime}} - {{endTime}} {{timeZone}}.',
                { startTime: data.startTime, endTime: data.endTime, timeZone: data.timeZone },
              )}
            </Typography>
          </Box>
        )}
        <FullTruckToScaleButtonBase onClick={onClick} disabled={!data.isSelfServiceAvailable} />
      </>
    </GeneralKioskView>
  );
};
