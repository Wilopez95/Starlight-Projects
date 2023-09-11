import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput } from '@root/common';

import { INewOrders } from '../../../../types';
import { IGenerateOrderPropPathInput } from '../../types';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Order.sections.Order.Text.';

const generateOrderPropsPath = ({ orderIndex, property }: IGenerateOrderPropPathInput) =>
  `orders[${orderIndex}].${property}`;

const ReplaceEquipments: React.FC<{ orderIndex: number }> = ({ orderIndex }) => {
  const { values, errors, handleChange } = useFormikContext<INewOrders>();
  const { t } = useTranslation();

  return (
    <Layouts.Margin top="1">
      <FormInput
        placeholder={t(`${I18N_PATH}DroppedEquipmentNumber`)}
        label={`${t('Text.DroppedEquipment')} #`}
        name={generateOrderPropsPath({
          property: 'droppedEquipmentItemCode',
          orderIndex,
        })}
        value={values.orders[orderIndex].droppedEquipmentItemCode}
        error={getIn(
          errors,
          generateOrderPropsPath({
            property: 'droppedEquipmentItemCode',
            orderIndex,
          }),
        )}
        onChange={handleChange}
      />
      <FormInput
        placeholder={t(`${I18N_PATH}PickedUpEquipmentNumber`)}
        label={`${t(`Text.PickedUpEquipment`)} #`}
        name={generateOrderPropsPath({
          property: 'pickedUpEquipmentItemCode',
          orderIndex,
        })}
        value={values.orders[orderIndex].pickedUpEquipmentItemCode}
        error={getIn(
          errors,
          generateOrderPropsPath({
            property: 'pickedUpEquipmentItemCode',
            orderIndex,
          }),
        )}
        onChange={handleChange}
      />
    </Layouts.Margin>
  );
};

export default observer(ReplaceEquipments);
