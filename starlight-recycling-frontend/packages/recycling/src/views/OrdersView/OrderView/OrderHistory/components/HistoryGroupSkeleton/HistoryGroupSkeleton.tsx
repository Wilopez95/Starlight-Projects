import React from 'react';

import { Skeleton } from '@material-ui/lab';

export const HistoryGroupSkeleton = () => {
  return (
    <>
      <Skeleton itemType="rect" width="100%" height={50} />
      <Skeleton itemType="rect" width="100%" height={50} />
      <Skeleton itemType="rect" width="100%" height={50} />
      <Skeleton itemType="rect" width="100%" height={50} />
      <Skeleton itemType="rect" width="100%" height={50} />
    </>
  );
};
