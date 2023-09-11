import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, TextInputElement } from '@starlightpro/shared-components';
import { getIn, setIn, useFormikContext } from 'formik';

import { DescriptiveTooltip, FormInput, Typography, WarningTooltip } from '@root/common';
import { IEditableLandfillOperation } from '@root/types';

import { MaterialsTotalInput } from './styles';

const I18N_PATH = 'components.forms.LandfillOperationEdit.RightPanel.';

export const Materials: React.FC = () => {
  const { values, handleChange, errors, validateField, setValues } =
    useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();

  const handleChangeMaterialQuantity = async (
    e: React.ChangeEvent<TextInputElement>,
    index: number,
  ) => {
    const { value, name } = e.target;

    const newTotal = values.materials.reduce((acc, cur, i) => {
      const current = i === index ? value : cur.value;

      return acc + +current;
    }, 0);

    await Promise.resolve(
      setValues(prev => {
        const updatedPrev: IEditableLandfillOperation = setIn(prev, name, +value);

        return {
          ...updatedPrev,
          materialsTotal: newTotal,
        };
      }),
    );

    validateField(name);
    validateField('materialsTotal');
  };

  return (
    <Layouts.Grid columns={4} gap="1">
      <Layouts.Cell width={4}>
        <Layouts.Margin bottom="3">
          <Typography variant="headerThree">
            {t('Text.Materials')}, %{'  '}
            <DescriptiveTooltip position="top" text={t(`${I18N_PATH}MaterialsTooltip`)} />
          </Typography>
        </Layouts.Margin>
      </Layouts.Cell>
      {values.materials.map((item, index) => {
        const inputKey = `materials[${index}].value`;

        return (
          <React.Fragment key={item.id}>
            <Layouts.Cell width={3} alignSelf="center">
              {item.description}{' '}
              {!item.mapped ? (
                <WarningTooltip position="top" text={t(`${I18N_PATH}MaterialTooltip`)} />
              ) : null}
            </Layouts.Cell>
            <Layouts.Cell width={1}>
              <FormInput
                name={inputKey}
                value={item.value}
                type="number"
                error={getIn(errors, inputKey)}
                onChange={e => handleChangeMaterialQuantity(e, index)}
                noError
              />
            </Layouts.Cell>
          </React.Fragment>
        );
      })}
      <Layouts.Cell width={3} alignSelf="center">
        <Layouts.Padding top="3">
          <Typography fontWeight="bold">{t('Text.Total')}</Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell width={1}>
        <Layouts.Padding top="3">
          <MaterialsTotalInput
            name="materialsTotal"
            value={values.materialsTotal}
            error={errors.materialsTotal}
            onChange={handleChange}
            disabled
            noError
          />
        </Layouts.Padding>
      </Layouts.Cell>
    </Layouts.Grid>
  );
};
