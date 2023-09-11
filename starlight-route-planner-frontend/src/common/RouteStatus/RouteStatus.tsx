import React, { useMemo } from 'react';

import { DailyRouteStatus, MasterRouteStatus } from '@root/consts';

import { StatusBadge } from '../StatusBadge';

import { IDailyRouteStatusParams, IMasterRouteStatusParams } from './types';

export const MasterRouteStatusBadge: React.FC<IMasterRouteStatusParams> = ({
  published,
  updating,
  editing,
}) => {
  const status = useMemo(() => {
    switch (true) {
      case published:
        return MasterRouteStatus.PUBLISHED;
      case updating || editing:
        return MasterRouteStatus.UPDATING;
      default:
        return MasterRouteStatus.UNPUBLISHED;
    }
  }, [published, updating, editing]);

  return <StatusBadge status={status as MasterRouteStatus} routeType="master-routes" />;
};

export const DailyRouteStatusBadge: React.FC<IDailyRouteStatusParams> = ({ status, editingBy }) => {
  const routeStatus = useMemo(() => {
    if (editingBy) {
      return DailyRouteStatus.UPDATING;
    }

    return status;
  }, [status, editingBy]);

  return <StatusBadge status={routeStatus} routeType="daily-routes" />;
};
