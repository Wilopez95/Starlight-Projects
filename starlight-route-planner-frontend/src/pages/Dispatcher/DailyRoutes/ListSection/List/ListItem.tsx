import React from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { Checkbox, EditIcon, Layouts, Typography } from '@starlightpro/shared-components';
import { BusinessLineTypeLabel, DailyRouteStatusBadge, RouteColorPreview } from '@root/common';

import { hasDataAttribute } from '@root/helpers';
import { IDailyRoute, MarkerItemTypes } from '@root/types';

import { IDropResult } from '@root/common/DragNDropList/types';
import * as Styles from './styled';
interface MyDragObject extends IDropResult, IDailyRoute {
  // Define any additional properties you need for your drag object
}

interface IListItem {
  route: IDailyRoute;
  handleCheckboxClick: (id: number) => void;
  handleRouteClick: (id: number) => void;
  tryOpenEditMode: (data: MyDragObject) => Promise<void>;
}

const I18N_PATH_ROUTE_LIST = 'quickViews.RoutesList.Text.';

export const ListItem: React.FC<IListItem> = ({
  route,
  handleCheckboxClick,
  handleRouteClick,
  tryOpenEditMode,
}) => {
  const { t } = useTranslation();

  const [, drop] = useDrop({
    accept: MarkerItemTypes.DAILY_ROUTES,
    drop: (dropData: MyDragObject) => {
      tryOpenEditMode({
        ...dropData,
        id: route.id,
      });
    },
  });

  const handleClick = (e: React.SyntheticEvent) => {
    if (hasDataAttribute(e, 'skipEvent')) {
      return;
    }

    handleRouteClick(route.id);
  };

  const handleCheckBox = () => {
    handleCheckboxClick(route.id);
  };

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
            style={{
              maxWidth: 150,
            }}
            cursor="pointer"
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
        <Styles.CountBlock>{route.workOrders.length}</Styles.CountBlock>
      </Styles.Row>
      <Layouts.Margin top="1" />
      <Styles.Row justifyContent="space-between" alignItems="center">
        <Layouts.Flex>
          <Layouts.Margin left="3" />
          <DailyRouteStatusBadge status={route.status} editingBy={route.editingBy} />
        </Layouts.Flex>
        {route.isEdited ? (
          <Layouts.Flex alignItems="center">
            <EditIcon />{' '}
            <Layouts.Margin top="0.5" left="1">
              <Styles.EditedLabel>{t(`${I18N_PATH_ROUTE_LIST}Edited`)}</Styles.EditedLabel>
            </Layouts.Margin>
          </Layouts.Flex>
        ) : null}
      </Styles.Row>
    </Styles.ListItem>
  );
};
