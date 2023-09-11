import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Select, Tooltip } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { convertToMondayZeroBase } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { MusterRouteStatusEnum } from '@root/stores/masterRoute/types';

import MasterRouteLabel from './MasterRouteLabel/MasterRouteLabel';
import { IMasterRouteSelect } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.components.MasterRouteSelect.Text.';

const MasterRouteSelect: React.FC<IMasterRouteSelect> = ({
  name,
  day,
  requiredByCustomer,
  showLabel,
  value,
}) => {
  const { setFieldValue } = useFormikContext();
  const { masterRouteStore } = useStores();
  const { t } = useTranslation();
  const intlConfig = useIntl();
  const convertedDays = useMemo(
    () => convertToMondayZeroBase(intlConfig.weekDays),
    [intlConfig.weekDays],
  );

  const options: ISelectOption[] = useMemo(
    () =>
      masterRouteStore.values
        .filter(route =>
          requiredByCustomer ? route.serviceDaysList.includes(convertedDays[day]) : true,
        )
        .map(route => {
          const disabled = route.status === MusterRouteStatusEnum.editing;
          const label = disabled ? (
            <Tooltip position="top" fullWidth text={t(`${I18N_PATH}UnavailableRoute`)}>
              <MasterRouteLabel
                route={route}
                disabled={route.status === MusterRouteStatusEnum.editing}
              />
            </Tooltip>
          ) : (
            <MasterRouteLabel
              route={route}
              disabled={route.status === MusterRouteStatusEnum.editing}
            />
          );

          return {
            // setting component as a string to be able to show a custom label
            label: label as unknown as string,
            value: route.name,
            disabled,
          };
        }),
    [day, convertedDays, masterRouteStore.values, requiredByCustomer, t],
  );

  return (
    <Select
      value={value}
      label={showLabel ? t(`${I18N_PATH}AssignedMasterRoute`) : null}
      name={name}
      placeholder={t(`${I18N_PATH}Placeholder`)}
      noOptionsMessage={t(`${I18N_PATH}NoOptionsMessage`)}
      options={options}
      onSelectChange={setFieldValue}
    />
  );
};

export default observer(MasterRouteSelect);
