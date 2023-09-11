import React from 'react';
import { DragObjectWithType, DropTargetMonitor, useDrop } from 'react-dnd';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';

import {
  BusinessLineTypeLabel,
  DaysStatusPreview,
  MasterRouteStatusBadge,
  RouteColorPreview,
} from '@root/common';

import { MasterRouteStatus } from '@root/consts';
import { hasDataAttribute } from '@root/helpers';
import { IMasterRoute, MarkerItemTypes } from '@root/types';

import { isEmpty } from 'lodash';
import { ActionsParams, CheckValidDndParamsType } from '../../common/MasterRouteActions/types';

import * as Styles from './styled';

interface IListItem {
  route: IMasterRoute;
  handleCheckboxClick: (id: number) => void;
  handleRouteClick: (id: number) => void;
  openEditMode: (data: { dndData: CheckValidDndParamsType; editData: ActionsParams }) => void;
}

export const ListItem: React.FC<IListItem> = ({
  route,
  handleCheckboxClick,
  handleRouteClick,
  openEditMode,
}) => {
  const handleCheckBox = () => {
    handleCheckboxClick(route.id);
  };

  const handleClick = (e: React.SyntheticEvent) => {
    if (hasDataAttribute(e, 'skipEvent')) {
      return;
    }

    handleRouteClick(route.id);
  };

  interface MyDragObject extends DragObjectWithType {
    // Define any additional properties you need for your drag object
    jobSiteGroupedItems: Array<number>;
    pinItemId: number;
    type: MarkerItemTypes;
  }

  const [, drop] = useDrop({
    accept: MarkerItemTypes.MASTER_ROUTES,
    drop: (dropData: MyDragObject) => {
      openEditMode({
        dndData: {
          routeName: route.name,
          serviceItems: route.serviceItems,
          serviceDaysList: route.serviceDaysList,
          ids: isEmpty(dropData.jobSiteGroupedItems)
            ? [dropData.pinItemId]
            : dropData.jobSiteGroupedItems,
        },
        editData: {
          ...dropData,
          name: route.name,
          id: route.id,
          published: route.published,
          truckId: route.truckId,
          driverId: route.driverId,
          status: route.status,
        },
      });
    },
    collect: (monitor: DropTargetMonitor) => ({
      canDrop: !!monitor.canDrop(),
      isOver: !!monitor.isOver(),
    }),
  });

  const isUpdating = route.status === MasterRouteStatus.UPDATING;
  const isEditing = route.status === MasterRouteStatus.EDITING;

  return (
    <Styles.ListItem alignItems="flex-start" onClick={handleClick} ref={drop} direction="column">
      <Styles.Row justifyContent="space-between" alignItems="center">
        <Layouts.Flex alignItems="center">
          <Checkbox name="item" onChange={handleCheckBox} value={route.checked} />
          <Layouts.Margin right="1" />
          <Typography
            color="default"
            as="label"
            ellipsis
            cursor="pointer"
            style={{
              maxWidth: 150,
            }}
            shade="standard"
            variant="headerFive"
          >
            {route.name}
          </Typography>
          <Layouts.Margin right="1" />
          <RouteColorPreview color={route.color} />
          <Layouts.Margin right="0.5" />
          <BusinessLineTypeLabel businessLineType={route.businessLineType} />
        </Layouts.Flex>
        {route.serviceItems.length ? (
          <Styles.CountBlock>{route.serviceItems.length}</Styles.CountBlock>
        ) : null}
      </Styles.Row>
      <Layouts.Margin top="1" />
      <Styles.Row justifyContent="space-between" alignItems="center">
        <Layouts.Flex>
          <Layouts.Margin left="3" />
          <MasterRouteStatusBadge
            published={route.published}
            editing={isEditing}
            updating={isUpdating}
          />
          {/* TODO add date key */}
        </Layouts.Flex>
        <DaysStatusPreview
          serviceDaysList={route.serviceDaysList}
          assignedServiceDaysList={route.assignedServiceDaysList}
        />
      </Styles.Row>
    </Styles.ListItem>
  );
};
