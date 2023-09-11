import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { DaysStatusPreview } from '@root/common';
import { ValidationMessageKeys } from '@root/pages/Dispatcher/MasterRouter/common/MasterRouteActions/types';
import { IHaulingServiceItem } from '@root/types';

import { RouteValidationModalBase } from '../RouteValidationModalBase';

const I18N_PATH = 'components.modals.RouteValidationModal.MasterRouteValidationModal.Text.';

interface IProps {
  items: IHaulingServiceItem[];
  routeName: string;
  validationMessageKey: ValidationMessageKeys;
  onClose(): void;
}

export const MasterRouteValidationModal: React.FC<IProps> = ({
  items,
  routeName,
  validationMessageKey,
  onClose,
}) => {
  const { t } = useTranslation();
  const title = t(`${I18N_PATH}Title`, {
    routeName,
  });

  const validationMessage = t(`${I18N_PATH}${validationMessageKey}ValidationMessage`);

  return (
    <RouteValidationModalBase title={title} validationMessage={validationMessage} onClose={onClose}>
      <Layouts.Margin top="2">
        <Typography color="default" as="label" shade="standard" variant="bodyMedium">
          {t(`${I18N_PATH}ServiceItemsCannotBeAdded`)}
        </Typography>
        <Layouts.Margin top="2">
          {items.map(item => {
            return (
              <Layouts.Flex key={item.id}>
                <Typography color="default" as="label" shade="standard" variant="bodyMedium">
                  #{item.id}
                  <Typography as="span" variant="bodyMedium" color="secondary" shade="desaturated">
                    ・{item.billableServiceDescription}
                  </Typography>
                </Typography>
                <Layouts.Margin left="auto">
                  <DaysStatusPreview serviceDaysOfWeek={item.serviceDaysOfWeek} />
                </Layouts.Margin>
              </Layouts.Flex>
            );
          })}
        </Layouts.Margin>
      </Layouts.Margin>
    </RouteValidationModalBase>
  );
};
