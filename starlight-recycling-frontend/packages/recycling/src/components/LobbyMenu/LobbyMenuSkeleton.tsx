import { Trans } from '../../i18n';
import React from 'react';
import cs from 'classnames';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import LobbyMenuItem from './LobbyMenuItem';
import { range } from 'lodash';

const useStyles = makeStyles(
  ({ spacing }) => ({
    menu: {
      maxHeight: 542,
      maxWidth: 620,
      width: '100%',
      height: '100%',
      borderRadius: 4,
      padding: spacing(2, 5),
    },
    scrollContainer: {
      maxHeight: 175,
      minHeight: 75,
      overflowX: 'auto',
    },
    bottomSpace: {
      marginBottom: spacing(1),
    },
    topSpace: {
      marginTop: spacing(1),
    },
    buChooseLabel: {
      fontWeight: 'bold',
    },
  }),
  { name: 'LobbyMenuSkeleton' },
);

export const LobbyMenuSkeleton: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <LobbyMenuItem
        key="loading"
        title="loading"
        subtitle="loading"
        components={{
          SubTitle: ({ className }) => <Skeleton variant="text" className={className} />,
          Title: ({ className }) => <Skeleton variant="text" className={className} />,
          MenuItemIconWrapper: ({ className }) => (
            <Skeleton variant="rect" width={40} height={40} className={className} />
          ),
        }}
      />

      <Typography
        key="chooseBU"
        variant="body2"
        className={cs(classes.bottomSpace, classes.buChooseLabel)}
      >
        <Trans>Business Units</Trans>
      </Typography>

      <Box className={classes.scrollContainer}>
        {range(3).map((x) => (
          <LobbyMenuItem
            key={x}
            title="loading"
            subtitle="loading"
            components={{
              SubTitle: ({ className }) => <Skeleton variant="text" className={className} />,
              Title: ({ className }) => <Skeleton variant="text" className={className} />,
              MenuItemIconWrapper: ({ className }) => (
                <Skeleton variant="rect" width={40} height={40} className={className} />
              ),
            }}
          />
        ))}
      </Box>

      <Typography
        key="choose-grading"
        variant="body2"
        className={cs(classes.bottomSpace, classes.topSpace, classes.buChooseLabel)}
      >
        <Trans>Gradings</Trans>
      </Typography>
      <Box className={classes.scrollContainer}>
        {range(3).map((x) => (
          <LobbyMenuItem
            key={x}
            title="loading"
            subtitle="loading"
            components={{
              SubTitle: ({ className }) => <Skeleton variant="text" className={className} />,
              Title: ({ className }) => <Skeleton variant="text" className={className} />,
              MenuItemIconWrapper: ({ className }) => (
                <Skeleton variant="rect" width={40} height={40} className={className} />
              ),
            }}
          />
        ))}
      </Box>
    </>
  );
};
