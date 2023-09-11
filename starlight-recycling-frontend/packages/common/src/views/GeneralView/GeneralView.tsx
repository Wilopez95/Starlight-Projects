import React, { ReactNode } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { Variant } from '@material-ui/core/styles/createTypography';
import cs from 'classnames';

const useStyles = makeStyles(({ spacing }) => ({
  pageTitle: {
    flexGrow: 1,
  },
  statusFieldColHeader: {
    width: 100,
  },
  content: {
    padding: spacing(3),
  },
}));

export interface GeneralViewProps {
  title?: ReactNode;
  actions?: JSX.Element;
  noHeader?: boolean;
  className?: string;
  titleVariant?: Variant;
}

export const GeneralView = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    className?: string;
  } & GeneralViewProps
>(({ title, titleVariant = 'h4', actions, className, noHeader, children }, ref) => {
  const classes = useStyles();

  return (
    <div ref={ref}>
      <Box className={cs(classes.content, className)}>
        {!noHeader && (
          <Box display="flex" alignItems="center" py={2}>
            {title && (
              <Typography className={classes.pageTitle} variant={titleVariant}>
                {title}
              </Typography>
            )}
            {actions && <Box textAlign="end">{actions}</Box>}
          </Box>
        )}
        <Paper elevation={0}>{children}</Paper>
      </Box>
    </div>
  );
});
