import React, { FC } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { EditOrderFormWrapper } from '../EditOrderFormWrapper';
import { LoadingInput } from '../../../../components/LoadingInput';

const useStyles = makeStyles(
  () => ({
    lastFieldLabel: {
      display: 'flex',
      alignSelf: 'flex-end',
      width: 60,
    },
    fieldRoot: {
      width: 140,
    },
  }),
  { name: 'LoadingEditOrderFormWrapper' },
);

export interface LoadingEditOrderFormWrapperProps {
  noDrawer?: boolean;
}

export const LoadingEditOrderFormWrapper: FC<LoadingEditOrderFormWrapperProps> = ({ noDrawer }) => {
  const classes = useStyles();

  return (
    <EditOrderFormWrapper
      noDrawer={noDrawer}
      formSidePanel={
        <Box flexGrow={1} p={4}>
          <Box mb={2}>
            <Typography variant="h5">
              <Skeleton />
            </Typography>
          </Box>
          <Box mb={2}>
            <Skeleton variant="text" width={50} />
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary">
              <Skeleton />
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                <Skeleton />
              </Typography>
            </Box>
          </Box>
          <Box mb={3}>
            <LoadingInput />
            <Box mb={2}></Box>
            <LoadingInput />
            <Box mb={2}></Box>
            <LoadingInput />
          </Box>
        </Box>
      }
    >
      <Box>
        <Typography variant="h6">
          <Skeleton width={60} />
        </Typography>
        <Box mb={2} />
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box display="flex" flexDirection="row" alignItems="flex-start">
            <LoadingInput classes={{ root: classes.fieldRoot }} />
            <Box padding={1} />
            <LoadingInput classes={{ root: classes.fieldRoot }} />
            <Box padding={1} />
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <LoadingInput classes={{ label: classes.lastFieldLabel, root: classes.fieldRoot }} />
          </Box>
        </Box>
      </Box>
    </EditOrderFormWrapper>
  );
};
