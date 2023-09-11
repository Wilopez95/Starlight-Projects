import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FormInput } from '@root/common';
import { IEditableLandfillOperation } from '@root/types';

const I18N_PATH = 'components.forms.LandfillOperationEdit.RightPanel.';

export const TruckSection: React.FC = () => {
  const { values, handleChange, errors } = useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();

  return (
    <Layouts.Grid rows={1} columns={5} gap="2">
      <Layouts.Cell width={1}>
        <FormInput
          label={`${t('Text.Truck')} #`}
          name="truck"
          value={values.truck}
          error={errors.truck}
          onChange={handleChange}
        />
      </Layouts.Cell>
      <Layouts.Cell width={2}>
        <FormInput
          label={t(`${I18N_PATH}Origin`)}
          name="origin"
          error={errors.origin}
          value={values.origin}
          onChange={handleChange}
        />
      </Layouts.Cell>
      <Layouts.Cell width={2}>
        <FormInput
          label={t(`${I18N_PATH}PO`)}
          name="purchaseOrder"
          error={errors.purchaseOrder}
          value={values.purchaseOrder}
          onChange={handleChange}
        />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};
