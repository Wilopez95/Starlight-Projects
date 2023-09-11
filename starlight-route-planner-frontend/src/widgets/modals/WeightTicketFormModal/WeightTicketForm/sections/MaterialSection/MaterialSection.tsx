import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import { useStores } from '@root/hooks';
import { IWeightTicket, WEIGHT_UNIT_ENUM } from '@root/types';
import { IWeightTicketSection } from '../../types';

const I18N_PATH = 'components.modals.WeightTicket.Text.';
const I18N_PATH_HELPERS = 'helpers.WeightUnit.';

export const MaterialSection: React.FC<IWeightTicketSection> = observer(({ styleProps }) => {
  const { materialStore } = useStores();
  const { errors, handleChange, values, setFieldValue } = useFormikContext<IWeightTicket>();
  const { t } = useTranslation();

  const weightUnitOptions = useMemo(() => {
    return Object.values(WEIGHT_UNIT_ENUM).map(weightUnit => {
      return {
        label: t(`${I18N_PATH_HELPERS}${weightUnit}`),
        value: weightUnit,
      };
    });
  }, [t]);

  return (
    <Layouts.Grid
      columns={String(`${styleProps.columnWidth} ${styleProps.columnWidth} auto`)}
      gap={styleProps.gap}
    >
      <FormInput
        name="loadValue"
        label={t(`${I18N_PATH}LoadValue`)}
        value={values.loadValue}
        type="number"
        limits={{
          min: 0,
        }}
        fixedLength={2}
        onChange={handleChange}
        error={errors.loadValue}
        countable
      />

      <Select
        placeholder={t('Text.Select')}
        label={t('Text.Units').concat('*')}
        name="weightUnit"
        value={values.weightUnit}
        options={weightUnitOptions}
        onSelectChange={setFieldValue}
        error={errors.weightUnit}
        nonClearable
      />

      <Layouts.Box width="100%">
        <Select
          placeholder={t('Text.Select')}
          label={t('Text.Material')}
          name="materialId"
          value={values.materialId}
          options={materialStore.getDropdownOptions}
          onSelectChange={(name, value) => setFieldValue(name, value ? value : null)}
          error={errors.materialId}
        />
      </Layouts.Box>
    </Layouts.Grid>
  );
});
