import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { ResetView as CommonResetView } from '@starlightpro/common';
import DefaultLogoImg from '../../images/recycling-icon@2x.png';
import BackgroundImage from '../../images/login-bg.png';

const useStyles = makeStyles((theme) => ({
  logo: {
    maxWidth: 66,
    maxHeight: 66,
    marginRight: theme.spacing(3),
  },
  loginLeftContainer: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      width: '50%',
      display: 'block',
      backgroundImage: `url('${BackgroundImage}')`,
      backgroundPosition: 'center bottom',
      backgroundSize: 'cover',
    },
    [theme.breakpoints.up('lg')]: {
      width: '61.75%',
    },
  },
}));

const ResetView: FC = () => {
  const classes = useStyles();

  return (
    <CommonResetView
      layout={{
        classes: {
          leftContainer: classes.loginLeftContainer,
        },
        logo: (
          <>
            <img src={DefaultLogoImg} alt="logo" className={classes.logo} />
            <Box>
              <Typography variant="h4">5280</Typography>
              <Typography variant="h6">Recycling Center</Typography>
            </Box>
          </>
        ),
      }}
    />
  );
};

export default ResetView;
