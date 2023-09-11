import React from 'react';
import Box from '@material-ui/core/Box';
import { Skeleton } from '@material-ui/lab';
import { times } from 'lodash-es';

export function GradingEditSkeleton() {
  return (
    <Box padding={3} display="flex" flexDirection="column">
      <Box flexDirection="row" display="flex" mb={4}>
        <Skeleton variant="text" width="12rem" />
        <Box flexGrow={1} />
        <Skeleton variant="rect" width="4rem" height="4rem" />
        <Box width="1rem" />
        <Skeleton variant="rect" width="4rem" height="4rem" />
        <Box width="1rem" />
        <Skeleton variant="rect" width="4rem" height="4rem" />
      </Box>
      <Box flexDirection="row" display="flex" height="4rem" mb={4}>
        <Skeleton variant="text" width="100%" />
      </Box>
      <Box flexDirection="row" display="flex" height={'4rem'} mb={5}>
        <Skeleton variant="text" width="100%" />
      </Box>
      {times(16, (v) => (
        <Box display="flex" key={v} mb={6} alignItems="center">
          <Box mb={2}>
            <Skeleton width="12rem" variant="text" />
          </Box>
          <Box flexGrow={1} mb={2} mr={2} ml={2}>
            <Skeleton variant="text" />
          </Box>
          <Box mb={2}>
            <Skeleton width="12rem" variant="text" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
