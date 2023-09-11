import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { capitalize } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { INewSubscription } from '../../../../../types';
import MasterRouteSelect from '../../MasterRouteSelect/MasterRouteSelect';

import { ISelectFrequencyDayItem } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.components.ServiceDays.SelectDayItem.SelectDayItem.Text.';

const SelectFrequencyDayItem: React.FC<ISelectFrequencyDayItem> = ({
  index,
  serviceDayOfWeek: { route, day, requiredByCustomer },
  serviceDaysPropsPath,
  availableDayOptions,
  isReadOnly,
}) => {
  const { t } = useTranslation();
  const { errors, handleChange, setFieldValue } = useFormikContext<INewSubscription>();

  const showLabels = index === 0;

  const options: ISelectOption[] = [
    {
      label: capitalize(day),
      value: day,
    },
    ...availableDayOptions,
  ];

  return (
    <Layouts.Box>
      <Layouts.Flex alignItems="baseline" justifyContent="space-between">
        <Layouts.Flex justifyContent="flex-start">
          <Layouts.Margin right="2">
            <Layouts.Box width="128px">
              <Select
                nonClearable
                label={showLabels ? t(`${I18N_PATH}Day`) : undefined}
                name={`${serviceDaysPropsPath}.${index}.day`}
                disabled={isReadOnly}
                onSelectChange={setFieldValue}
                value={day}
                options={options}
                error={getIn(errors, `${serviceDaysPropsPath}.${index}.day`)}
              />
            </Layouts.Box>
          </Layouts.Margin>
          <Layouts.Margin margin={showLabels ? 'auto' : '0'} left="2">
            <Layouts.Box width="164px">
              <Checkbox
                name={`${serviceDaysPropsPath}.${index}.requiredByCustomer`}
                value={requiredByCustomer}
                disabled={isReadOnly}
                error={getIn(errors, `${serviceDaysPropsPath}.${index}.requiredByCustomer`)}
                onChange={handleChange}
              >
                {t(`${I18N_PATH}RequiredByCustomer`)}
              </Checkbox>
            </Layouts.Box>
          </Layouts.Margin>
        </Layouts.Flex>
        <Layouts.Box width="428px">
          <Layouts.Margin margin={showLabels ? 'auto' : '0'} left="2">
            <MasterRouteSelect
              name={`${serviceDaysPropsPath}.${index}.route`}
              day={day}
              requiredByCustomer={requiredByCustomer}
              showLabel={showLabels}
              value={route}
            />
          </Layouts.Margin>
        </Layouts.Box>
      </Layouts.Flex>
    </Layouts.Box>
  );
};

export default observer(SelectFrequencyDayItem);
