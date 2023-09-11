import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { DaysStatusPreview, MasterRouteStatusBadge, PublishingIndicator } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { MasterRouteStatus } from '@root/consts';
import { useIntl } from '@root/i18n/useIntl';
import { useMasterRoutesMap, useMergedMapData } from '@root/providers/MasterRoutesMapProvider';
import { QuickViewHeaderTitle } from '@root/quickViews';

import { useMasterRouteActionsContext } from '../../common/MasterRouteActions/MasterRouteActions';

import * as Styles from './styles';
import { Tabs } from './Tabs';
import { IForm } from './types';

const I18N_PATH = 'quickViews.MasterRouteDetailsView.Text.';
const I18N_PATH_MR = 'quickViews.MasterRouteProgress.Text.';

export const Form: React.FC<IForm> = memo(({ scrollContainerHeight, info, onAddRef, onClose }) => {
  const masterRouteActions = useMasterRouteActionsContext();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const { handleCustomizedRoutesOptions, handleCustomizedMarkers, clearCustomized } =
    useMasterRoutesMap();
  const { masterRoutesServiceItems } = useMergedMapData();

  const isPublished = info.published;

  useEffect(() => {
    info.serviceItems.forEach((item, index) => {
      const exists = masterRoutesServiceItems.find(v => v.pinItemId === item.id);

      if (exists) {
        handleCustomizedMarkers({
          ...exists,
          rootMarkerId: item.id,
          showSequence: true,
        });

        // Draw on map markers options (for third level), pass original id key
        handleCustomizedRoutesOptions(item.id, {
          optionColor: info.color,
          visible: true,
          sequence: index + 1,
        });
      }
    });

    return () => {
      clearCustomized();
    };
  }, [
    info,
    handleCustomizedRoutesOptions,
    handleCustomizedMarkers,
    clearCustomized,
    masterRoutesServiceItems,
  ]);

  const triggerPublishUnpublish = (published: boolean) => {
    published ? masterRouteActions.triggerUnpublish(info) : masterRouteActions.triggerPublish(info);
  };

  const isUpdating = info.status === MasterRouteStatus.UPDATING;
  const isEditing = info.status === MasterRouteStatus.EDITING;

  return (
    <>
      <Layouts.Box ref={onAddRef} position="relative">
        <Layouts.Padding padding="2">
          <Layouts.Flex alignItems="center">
            <Styles.BackIcon cursor="pointer" onClick={onClose} />
            <Typography variant="bodyMedium" color="information">
              {t(`${I18N_PATH}Back`)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
      <Layouts.Scroll height={scrollContainerHeight}>
        <Layouts.Padding left="2" right="2" bottom="2">
          <QuickViewHeaderTitle
            name={info.name}
            color={info.color}
            businessLineType={info.businessLineType}
          >
            {info.name}
          </QuickViewHeaderTitle>
          <Layouts.Margin top="1" />
          <Layouts.Flex justifyContent="space-between" alignItems="center">
            <Layouts.Flex>
              <MasterRouteStatusBadge
                published={info.published}
                editing={isEditing}
                updating={isUpdating}
              />
              {info.published && info.publishDate ? (
                <Layouts.Margin left="1">
                  <Typography color="secondary" shade="light">
                    {t(`${I18N_PATH}FromDate`, {
                      date: formatDateTime(new Date(info.publishDate)).date,
                    })}
                  </Typography>
                </Layouts.Margin>
              ) : null}
            </Layouts.Flex>
            <DaysStatusPreview
              serviceDaysList={info.serviceDaysList}
              assignedServiceDaysList={info.assignedServiceDaysList}
            />
          </Layouts.Flex>
          {isUpdating ? (
            <Layouts.Margin top="2">
              <PublishingIndicator text={t(`${I18N_PATH_MR}CreatingDailyRoutes`)} desaturated />
            </Layouts.Margin>
          ) : null}
          <Layouts.Padding top="2" bottom="2">
            <Tabs masterRoute={info} />
          </Layouts.Padding>
        </Layouts.Padding>
      </Layouts.Scroll>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Divider />
        <Layouts.Padding top="2" bottom="2" left="3" right="3">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={() => triggerPublishUnpublish(isPublished)}>
              {t(`${I18N_PATH}${isPublished ? 'Unpublish' : 'Publish'}`)}
            </Button>
            <Button
              variant="primary"
              onClick={() => masterRouteActions.triggerEdit(info)}
              disabled={isUpdating}
            >
              {t(`${I18N_PATH}EditRoute`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
});

Form.displayName = 'Form';
