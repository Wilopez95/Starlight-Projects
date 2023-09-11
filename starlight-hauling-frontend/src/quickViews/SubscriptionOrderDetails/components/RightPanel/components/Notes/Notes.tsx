import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput } from '@root/common';
import { IConfigurableSubscriptionOrder } from '@root/types/entities/subscriptionOrder/subscriptionOrder';

const I18N_PATH =
  'quickViews.SubscriptionOrderDetails.components.RightPanel.components.Notes.Text.';

const Notes: React.FC = () => {
  const { t } = useTranslation();
  const { values, errors, handleChange } = useFormikContext<IConfigurableSubscriptionOrder>();
  const isNonService = values.noBillableService;

  return (
    <>
      <Layouts.Cell left="1" width={2}>
        <FormInput
          label={
            isNonService ? t(`${I18N_PATH}Instructions`) : t(`${I18N_PATH}InstructionsForDriver`)
          }
          name="instructionsForDriver"
          placeholder={t(`${I18N_PATH}AddSomeNotes`)}
          value={values.instructionsForDriver}
          error={errors.instructionsForDriver}
          onChange={handleChange}
          area
        />
      </Layouts.Cell>
      <Layouts.Cell left="3" width={2}>
        <FormInput
          label={t(`${I18N_PATH}InvoiceNote`)}
          name="invoiceNotes"
          placeholder={t(`${I18N_PATH}AddSomeInvoiceNotes`)}
          value={values.invoiceNotes}
          onChange={handleChange}
          error={errors.invoiceNotes}
          area
        />
      </Layouts.Cell>
    </>
  );
};

export default observer(Notes);
