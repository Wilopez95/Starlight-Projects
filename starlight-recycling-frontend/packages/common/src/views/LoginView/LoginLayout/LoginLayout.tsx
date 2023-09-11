import React, { FC } from 'react';
import cx from 'classnames';
import { Trans, useTranslation } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import StarlightLogo from './StarlightLogo';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100%',
  },
  leftContainer: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      width: '50%',
      display: 'block',
    },
    [theme.breakpoints.up('lg')]: {
      width: '61.75%',
    },
  },
  rightContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: theme.spacing(0, 4),
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '50%',
      height: '100%',
      padding: theme.spacing(0, 12.5),
    },
    [theme.breakpoints.up('lg')]: {
      width: '38.25%',
    },
  },
  rightInner: {
    width: '100%',
    height: '100%',
    maxWidth: 410,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  poweredBy: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(2),
    '& svg': {
      height: 18,
      marginLeft: theme.spacing(2),
      marginBottom: theme.spacing(0.5),
    },
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(10),
    },
  },
}));

export interface LoginLayoutClasses {
  leftContainer?: string;
}

export interface LoginLayoutProps {
  leftContent?: JSX.Element;
  logo?: JSX.Element;
  classes?: LoginLayoutClasses;
}

const LoginLayout: FC<LoginLayoutProps> = ({ children, leftContent, logo, classes: clsss }) => {
  const [t] = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={cx(classes.leftContainer, clsss?.leftContainer)}>{leftContent}</Box>
      <Box className={classes.rightContainer}>
        <Box className={classes.rightInner}>
          <Box className={classes.content}>
            <Box display="flex" alignItems="center" mb={11}>
              {logo}
            </Box>
            {children}
          </Box>
          <Box className={classes.poweredBy}>
            <Typography variant="caption">
              <Trans>Powered by</Trans>
            </Typography>

            <Link title={t('Starlight Solutions')} href="https://starlightsoftwaresolutions.com/">
              <StarlightLogo />
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginLayout;
