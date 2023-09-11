import React, { ReactNode } from 'react';
import Box from '@material-ui/core/Box';
import { GeneralView } from '@starlightpro/common';
import { makeStyles } from '@material-ui/core/styles';
import { GeneralViewProps } from '@starlightpro/common/src/views/GeneralView/GeneralView';
import Typography from '@material-ui/core/Typography';
import cs from 'classnames';
import { selfServiceFooterHeight } from '../SelfServiceFooter';

const useStyles = makeStyles(({ appHeader, spacing, palette }) => ({
  root: {
    paddingBottom: 0,
    paddingTop: 0,
    display: 'flex',

    '& > div': {
      width: '100%',
    },
  },
  scrollContainer: {
    height: `calc(100vh - ${appHeader.height}px - ${selfServiceFooterHeight}px)`,
    overflowY: 'auto',
    margin: `0 -${spacing(3)}px`,
    padding: `0 ${spacing(3)}px`,
    paddingBottom: spacing(3),
  },
  title: {
    textTransform: 'uppercase',
  },
  footer: {
    boxShadow: `0 -4px 8px ${palette.grey[200]}`,
    margin: `0 -${spacing(3)}px`,
    padding: `0 ${spacing(3)}px`,
    position: 'relative',
    height: selfServiceFooterHeight,
  },
}));

export interface GeneralKioskViewProps extends GeneralViewProps {
  footer?: ReactNode;
}

export const GeneralKioskView: React.FC<GeneralKioskViewProps> = ({
  footer,
  children,
  title,
  className,
  ...props
}) => {
  const classes = useStyles();

  return (
    <GeneralView
      {...props}
      className={cs(classes.root, className)}
      noHeader
      children={
        <Box width="100%" display="flex" flexDirection="column" justifyContent="space-between">
          <Box className={classes.scrollContainer}>
            <Box display="flex" alignItems="center" py={2}>
              {title && (
                <Typography className={classes.title} variant="h4">
                  {title}
                </Typography>
              )}
            </Box>
            <Box pb={1}>{children}</Box>
          </Box>
          <Box className={classes.footer}>{footer}</Box>
        </Box>
      }
    />
  );
};
