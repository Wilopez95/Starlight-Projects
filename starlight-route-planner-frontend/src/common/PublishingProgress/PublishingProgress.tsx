import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography, useToggle } from '@starlightpro/shared-components';

import { ArrowIcon } from '../TableTools/TableNavigationHeader/styles';

import { PublishingIndicator } from './PublishingIndicator';
import { Box, CrossIcon, Wrapper } from './styles';
import { IPublishProgress } from './types';

const I18N_PATH = 'quickViews.MasterRouteProgress.Text.';

export const PublishingProgress: React.FC<IPublishProgress> = ({ updatingRoutes, onClose }) => {
  const { t } = useTranslation();
  const [isExpanded, toggleDetails] = useToggle();

  const showHideDetailsText = useMemo(() => {
    return isExpanded ? t(`${I18N_PATH}HideDetails`) : t(`${I18N_PATH}ShowDetails`);
  }, [isExpanded, t]);

  if (!updatingRoutes.length) {
    return null;
  }

  return (
    <Wrapper
      position="absolute"
      width="100%"
      minHeight="35px"
      top="0"
      backgroundColor="primary"
      backgroundShade="desaturated"
    >
      <Box width="100%" height="35px">
        <Layouts.Padding left="2">
          <Layouts.Flex alignItems="center" gap="8px">
            <PublishingIndicator text={`${t(`${I18N_PATH}CreatingDailyRoutes`)}...`} />

            <Typography variant="bodySmall" color="information" onClick={toggleDetails}>
              <Layouts.Flex alignItems="center" gap="5px">
                {showHideDetailsText}{' '}
                <ArrowIcon $active={!isExpanded} color="information" shade="standard" />
              </Layouts.Flex>
            </Typography>
          </Layouts.Flex>
        </Layouts.Padding>
        <Layouts.Margin right="1">
          <Typography cursor="pointer">
            <Layouts.Padding padding="1" onClick={onClose}>
              <CrossIcon />
            </Layouts.Padding>
          </Typography>
        </Layouts.Margin>
      </Box>

      {isExpanded
        ? updatingRoutes.map(route => (
            <Box width="100%" height="35px" key={route.id}>
              <Layouts.Padding left="2">
                <Layouts.Flex alignItems="center" gap="8px">
                  <Typography variant="bodySmall" shade="dark">
                    {t(`${I18N_PATH}From`)}
                    <Typography as="span" color="information">
                      {route.name}
                    </Typography>
                  </Typography>
                </Layouts.Flex>
              </Layouts.Padding>
            </Box>
          ))
        : null}
    </Wrapper>
  );
};
