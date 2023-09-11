import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, TimePicker } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { TFunction } from 'i18next';

import { ButtonSelect } from '@root/common';
import { buildPath } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { formatBestTimeToCome, getBestTimeToComeFromAndTo } from './helpers';
import { BestTimeToCome, IOrderTimePicker, IOrderTimePickerData } from './types';

const I18N_PATH = `components.OrderTimePicker.Text.`;

export const defaultBestTimeToCome = new Date(0, 0, 0, 12);

export const timeItems = (t: TFunction): ISelectOption[] => [
  { label: t(`${I18N_PATH}Anytime`), value: 'any' },
  { label: t(`${I18N_PATH}AM`), value: 'am' },
  { label: t(`${I18N_PATH}PM`), value: 'pm' },
  { label: t(`${I18N_PATH}Specific`), value: 'specific' },
];

const OrderTimePicker: React.FC<IOrderTimePicker> = ({
  staticMode,
  disabled,
  basePath: basePathProp = '',
}) => {
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  const { values, errors, setFieldValue, setFieldError, dirty } =
    useFormikContext<IOrderTimePickerData>();

  const basePath = useMemo(() => (basePathProp ? [basePathProp] : []), [basePathProp]);

  useEffect(() => {
    if (dirty) {
      return;
    }

    const bestTimeToComeFromValue: string | Date | null = getIn(
      values,
      buildPath('bestTimeToComeFrom', basePath),
    );
    const bestTimeToComeToValue: string | Date | null = getIn(
      values,
      buildPath('bestTimeToComeTo', basePath),
    );

    const { bestTimeToCome } = formatBestTimeToCome(bestTimeToComeFromValue, bestTimeToComeToValue);

    setFieldValue(buildPath('bestTimeToCome', basePath), bestTimeToCome);
  }, [
    basePath,
    dirty,
    formatDateTime,
    setFieldValue,
    values,
    values.bestTimeToComeFrom,
    values.bestTimeToComeTo,
  ]);

  const handleChange = useCallback(
    (_: string, value: BestTimeToCome) => {
      const { bestTimeToComeFrom, bestTimeToComeTo } = getBestTimeToComeFromAndTo(value);

      setFieldValue(buildPath('bestTimeToCome', basePath), value);
      setFieldValue(buildPath('bestTimeToComeFrom', basePath), bestTimeToComeFrom);
      setFieldValue(buildPath('bestTimeToComeTo', basePath), bestTimeToComeTo);

      setFieldError(buildPath('bestTimeToCome', basePath), undefined);
      setFieldError(buildPath('bestTimeToComeFrom', basePath), undefined);
      setFieldError(buildPath('bestTimeToComeTo', basePath), undefined);
    },
    [basePath, setFieldError, setFieldValue],
  );

  return (
    <>
      <ButtonSelect
        label={t(`${I18N_PATH}BestTimeForADriverToCome`)}
        items={timeItems(t)}
        name={buildPath('bestTimeToCome', basePath)}
        value={getIn(values, buildPath('bestTimeToCome', basePath))}
        error={getIn(errors, buildPath('bestTimeToCome', basePath))}
        onSelectionChange={handleChange}
        disabled={disabled}
      />
      {getIn(values, buildPath('bestTimeToCome', basePath)) === 'specific' ? (
        <Layouts.Flex>
          <Layouts.Column>
            <TimePicker
              label={t(`${I18N_PATH}From`)}
              name={buildPath('bestTimeToComeFrom', basePath)}
              value={getIn(values, buildPath('bestTimeToComeFrom', basePath))}
              error={getIn(errors, buildPath('bestTimeToComeFrom', basePath))}
              defaultValue={defaultBestTimeToCome}
              onChange={setFieldValue}
              staticMode={staticMode}
              disabled={disabled}
            />
          </Layouts.Column>
          <Layouts.Column>
            <TimePicker
              label={t(`${I18N_PATH}To`)}
              name={buildPath('bestTimeToComeTo', basePath)}
              value={getIn(values, buildPath('bestTimeToComeTo', basePath))}
              error={getIn(errors, buildPath('bestTimeToComeTo', basePath))}
              defaultValue={defaultBestTimeToCome}
              onChange={setFieldValue}
              staticMode={staticMode}
              disabled={disabled}
            />
          </Layouts.Column>
        </Layouts.Flex>
      ) : null}
    </>
  );
};

export default OrderTimePicker;
