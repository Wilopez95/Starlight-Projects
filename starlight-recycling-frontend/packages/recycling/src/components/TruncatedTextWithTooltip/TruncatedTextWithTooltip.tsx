import React, { FC } from 'react';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(({ spacing }) =>
  createStyles({
    root: {
      display: 'flex',
    },
    cell: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    tooltip: {
      '& b': {
        fontStyle: 'italic',
        padding: spacing(0, 0.5),
      },
    },
  }),
);

export interface TruncatedTextWithTooltipProps {
  value: any;
  title?: React.ReactElement;
  classes?: {
    root?: string;
    tooltip?: string;
    cell?: string;
  };
  rootElementType?: React.ElementType;
}

export const TruncatedTextWithTooltip: FC<TruncatedTextWithTooltipProps> = ({
  value,
  title = <>{value}</>,
  classes: classesProp,
  rootElementType,
}) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <Box component={rootElementType} className={classes.root}>
      <Tooltip
        title={title}
        interactive
        arrow
        placement="bottom"
        classes={{ tooltip: classes.tooltip }}
      >
        <Box className={classes.cell}>{value}</Box>
      </Tooltip>
    </Box>
  );
};

export default TruncatedTextWithTooltip;
