import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { ICustomizedWorkOrder } from '@root/pages/Dispatcher/DailyRoutes/quickViews/DailyRouteQuickView/formikData';

import { RouteValidationModalBase } from '../RouteValidationModalBase';

const I18N_PATH = 'components.modals.RouteValidationModal.DailyRouteValidationModal.Text.';

interface IProps {
  items: ICustomizedWorkOrder[];
  routeName: string;

  onClose(): void;
}

export const DailyRouteValidationModal: React.FC<IProps> = ({ items, routeName, onClose }) => {
  const { t } = useTranslation();

  const title = t(`${I18N_PATH}Title`, {
    routeName,
  });

  const validationMessage = t(`${I18N_PATH}BusinessLineValidationMessage`);

  return (
    <RouteValidationModalBase title={title} validationMessage={validationMessage} onClose={onClose}>
      <Layouts.Margin top="2">
        <Typography color="default" as="label" shade="standard" variant="bodyMedium">
          {t(`${I18N_PATH}WorkOrdersCannotBeAdded`)}
        </Typography>
        <Layouts.Margin top="2">
          {items.map(item => {
            return (
              <Layouts.Flex key={item.id}>
                <Typography color="default" as="label" shade="standard" variant="bodyMedium">
                  #{item.displayId}
                  <Typography as="span" variant="bodyMedium" color="secondary" shade="desaturated">
                    ・{item.billableServiceDescription}
                  </Typography>
                </Typography>
              </Layouts.Flex>
            );
          })}
        </Layouts.Margin>
      </Layouts.Margin>
    </RouteValidationModalBase>
  );
};
