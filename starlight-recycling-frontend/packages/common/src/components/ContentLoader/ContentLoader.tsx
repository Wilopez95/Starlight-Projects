import React, { memo } from 'react';
import cs from 'classnames';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(
  ({ palette, transitions }) =>
    createStyles({
      root: {
        zIndex: 1000,
        position: 'relative',

        '&:before': {
          zIndex: 1,
          content: '"\\00a0"',
          pointerEvents: 'none', // Transparent to the hover style.
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: palette.grey[50],
          opacity: 0.6,
          transition: transitions.create('opacity', {
            duration: transitions.duration.shorter,
          }),
        },
      },
      loaderWrapper: {
        zIndex: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
      icon: {
        '& svg': {
          width: 40,
          height: 40,
        },
      },
      expanded: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    }),
  { name: 'ContentLoader' },
);

export interface ContentLoaderProps {
  expanded?: boolean;
}

export const ContentLoader = memo<ContentLoaderProps>(({ expanded }) => {
  const classes = useStyles();

  return (
    <Box className={cs(classes.root, { [classes.expanded]: expanded })}>
      <Box className={classes.loaderWrapper}>
        <CircularProgress className={classes.icon} />
      </Box>
    </Box>
  );
});
