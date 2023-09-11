import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormInput, Layouts, Select } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { FileInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { materialToSelectOption, normalizeOptions } from '@root/helpers';
import { useStores, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';

import { FormContainerLayout } from '../layout/FormContainer';
import { IForm } from '../types';

import { defaultValue, validationSchema } from './formikData';
import { INewManifestWithFile } from './types';

const I18N_PATH = 'components.forms.AddManifestForm.';

const AddManifest: React.FC<IForm<INewManifestWithFile>> = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const formik = useFormik<INewManifestWithFile>({
    initialValues: defaultValue,
    onSubmit,
    validationSchema,
    validateOnChange: false,
  });

  const { materialStore } = useStores();
  const materials = materialStore.sortedValuesByAlphabet;

  const materialOptions = materials.map(materialToSelectOption);
  const { currentUser } = useUserContext();

  const unitOptions =
    currentUser?.company?.unit === Units.metric
      ? normalizeOptions([
          { value: 'ton', label: 'Tonne' },
          { value: 'yard', label: 'Meter' },
        ])
      : normalizeOptions(['ton', 'yard']);

  const { values, handleChange, errors, setFieldValue } = formik;

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}Text.AddManifest`)}</Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1} justifyContent="space-around">
          <Layouts.Padding top="3" left="5" right="5">
            <Layouts.Grid gap="2" columns="120px 80px 100px 320px">
              <Layouts.Cell>
                <FormInput
                  label={t(`${I18N_PATH}Form.ManifestNumber`)}
                  name="manifestNumber"
                  onChange={handleChange}
                  value={values.manifestNumber}
                  error={errors.manifestNumber}
                  placeholder="Number"
                />
              </Layouts.Cell>
              <Layouts.Cell>
                <FormInput
                  label={t('Text.Value')}
                  name="quantity"
                  onChange={handleChange}
                  type="number"
                  value={values.quantity}
                  error={errors.quantity}
                />
              </Layouts.Cell>
              <Layouts.Cell>
                <Select
                  name="unitType"
                  onSelectChange={setFieldValue}
                  value={values.unitType}
                  error={errors.unitType}
                  options={unitOptions}
                  label={t('Text.Units')}
                  placeholder={t('Text.Units')}
                  nonClearable
                />
              </Layouts.Cell>
              <Layouts.Cell>
                <Select
                  name="materialId"
                  label={t('Text.Material')}
                  onSelectChange={setFieldValue}
                  value={values.materialId ?? undefined}
                  error={errors.materialId}
                  options={materialOptions}
                  placeholder={t('Text.Material')}
                />
              </Layouts.Cell>
            </Layouts.Grid>
            <FileInput
              onChange={setFieldValue}
              name="file"
              value={values.file}
              label={t(`${I18N_PATH}Form.ManifestFileLabel`)}
              error={errors.file}
            />
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={() => onClose()}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t(`${I18N_PATH}Text.AddManifest`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default observer(AddManifest);
