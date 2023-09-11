import React, { FC } from 'react';
import cs from 'classnames';
import { Trans } from '../../../i18n';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginBottom: theme.spacing(3),
  },
  paragraph: {
    marginBottom: theme.spacing(3),
  },
  hidden: {
    visibility: 'hidden',
  },
}));

const LogoRequirements: FC = () => {
  const classes = useStyles();

  return (
    <Paper elevation={0} className={classes.paper}>
      <Box padding={4}>
        <Typography variant="h5">
          <Trans>Logo requirements</Trans>
        </Typography>
        <Box display="flex">
          <Box display="flex" flexDirection="column" flex={1} mr={3} alignItems="center">
            <Typography variant="subtitle1" className={cs(classes.paragraph, classes.hidden)}>
              <Trans>Or as specific as</Trans>
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
              <Trans>logoRequirementsParagraph1</Trans>
            </Typography>
          </Box>
          <Box flex={1} ml={3}>
            <Typography variant="subtitle1" className={classes.paragraph}>
              <Trans>Or as specific as</Trans>
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" className={classes.paragraph}>
                  <Trans>PNG images with no background display the best</Trans>
                </Typography>
              </li>
              <li>
                <Typography variant="body2" className={classes.paragraph}>
                  <Trans>Do not use tall images. For best results, use a horizontal logo</Trans>
                </Typography>
              </li>
            </ul>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default LogoRequirements;
