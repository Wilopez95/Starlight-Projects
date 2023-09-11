import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';

import { IDailyRouteCreated } from './types';

const I18N_ROOT_PATH = 'Text.';

export const DailyRouteCreated: React.FC<IDailyRouteCreated> = ({ dailyRouteId, children }) => {
  const { t } = useTranslation();

  return (
    <>
      {dailyRouteId && (
        <SubjectRow subject="Daily Route">
          <Layouts.Margin right="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              #{dailyRouteId}
            </Badge>
          </Layouts.Margin>
          {t(`${I18N_ROOT_PATH}Created`)}
        </SubjectRow>
      )}
      {children}
    </>
  );
};
