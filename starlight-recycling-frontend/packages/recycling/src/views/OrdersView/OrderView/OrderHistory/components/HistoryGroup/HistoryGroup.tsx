import React, { FC } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import moment from 'moment';
import { formatHistoryItems } from './helpers';

interface Props {
  timestamp: any;
  historyItems: any[];
}

const useStyles = makeStyles((theme) => ({
  timestamp: {
    color: theme.palette.grey[500],
    ...theme.typography.body2,
  },
}));

export const HistoryGroup: FC<Props> = ({ timestamp, historyItems }) => {
  const classes = useStyles();
  const historyItemTime = moment(timestamp).format('hh:mm A');
  const historyItemDate = moment(timestamp).format('DD MMM, YYYY');

  const { user } = historyItems[0];

  const data = formatHistoryItems(historyItems);

  const filteredData = Array.isArray(data) ? data.flat().filter(Boolean) : data;

  return (
    filteredData && (
      <Box mt={2}>
        <Typography key={historyItemTime} className={classes.timestamp}>
          {historyItemTime}・{historyItemDate} by {user}
        </Typography>
        <Box mt={1} mb={0.5}>
          {filteredData}
        </Box>
      </Box>
    )
  );
};
