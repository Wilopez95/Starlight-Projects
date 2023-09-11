import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput } from '@root/common';
import { useStores } from '@root/hooks';
import { IEditableLandfillOperation } from '@root/types';

const MaterialSection: React.FC = () => {
  const { materialStore } = useStores();
  const { values, handleChange, errors, setFieldValue } =
    useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();

  const materials = materialStore.values;

  const materialsOptions: ISelectOption[] = useMemo(() => {
    return materials.map(x => ({
      value: x.id,
      label: x.description,
    }));
  }, [materials]);

  return (
    <Layouts.Grid rows={1} columns={5} gap="2">
      <Layouts.Cell width={1}>
        <FormInput
          label={t('Text.MaterialCode')}
          name="materialCode"
          value={values.materialCode}
          error={errors.materialCode}
          onChange={handleChange}
          readOnly
        />
      </Layouts.Cell>
      <Layouts.Cell width={4}>
        <Select
          label={t('Text.Material')}
          name="mappedMaterialId"
          options={materialsOptions}
          error={errors.mappedMaterialId}
          value={values.mappedMaterialId ?? undefined}
          onSelectChange={setFieldValue}
        />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};

export default observer(MaterialSection);
