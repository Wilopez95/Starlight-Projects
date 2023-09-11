import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Badge, Tooltip } from '@root/common';
import { useBusinessContext, useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { getBusinessLineTypesValue } from '@root/stores/dailyRoute/helpers';

import { IRouteSelect } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.components.MasterRouteSelect.Text.';

const RouteSelect: React.FC<IRouteSelect> = ({
  serviceDate,
  serviceAreaId,
  businessLineType,
  ...props
}) => {
  const { dailyRouteStore } = useStores();
  const { t } = useTranslation();
  const { format } = useTimeZone();
  const { businessUnitId } = useBusinessContext();
  const { dateFormat } = useIntl();

  const formattedServiceDate = useMemo(
    () => format(serviceDate, dateFormat.dateDefault),
    [format, serviceDate, dateFormat.dateDefault],
  );

  useEffect(() => {
    dailyRouteStore.cleanup();

    dailyRouteStore.request({
      businessUnitId: +businessUnitId,
      input: {
        businessLineTypes: getBusinessLineTypesValue(businessLineType),
        serviceAreaIds: [serviceAreaId],
        serviceDate: formattedServiceDate,
      },
    });

    return () => {
      dailyRouteStore.cleanup();
    };
  }, [businessUnitId, businessLineType, dailyRouteStore, serviceAreaId, formattedServiceDate]);

  const options: ISelectOption[] = useMemo(() => {
    const dailyRoutes = dailyRouteStore.values.filter(
      el => el.serviceDate === formattedServiceDate,
    );
    const routes = dailyRoutes
      ? dailyRoutes.map(route => {
          const disabled = !!route.editingBy;

          const label = route.editingBy ? (
            <Layouts.Flex>
              <Tooltip position="top" text={t(`${I18N_PATH}UnavailableRoute`)}>
                {route.name}
              </Tooltip>
              <Layouts.Margin left="2">
                <Badge>{t(`${I18N_PATH}Updating`)}</Badge>
              </Layouts.Margin>
            </Layouts.Flex>
          ) : (
            route.name
          );

          return {
            value: route.name,
            // setting it as string to show the Tooltip on hover
            label: label as unknown as string,
            disabled,
          };
        })
      : [];

    return routes;
  }, [dailyRouteStore.values, formattedServiceDate, t]);

  const { value: propsValue, name: selectName, onSelectChange } = props;

  useEffect(() => {
    const hasSelectedOption = options.find(({ value }) => value === propsValue);

    if (!hasSelectedOption && !dailyRouteStore.loading) {
      // clear select value on options change
      onSelectChange(selectName, '');
    }
  }, [onSelectChange, options, propsValue, selectName, dailyRouteStore.loading]);

  return <Select {...props} options={options} />;
};

export default observer(RouteSelect);
