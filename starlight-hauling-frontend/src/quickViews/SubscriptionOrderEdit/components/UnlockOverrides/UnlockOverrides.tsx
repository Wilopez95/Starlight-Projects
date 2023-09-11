import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext, yupToFormErrors } from 'formik';

import { Switch } from '@root/common';
import { IConfigurableSubscriptionOrder } from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.Text.';

export const UnlockOverrides: React.FC = () => {
  const { values, setFieldValue, setErrors } = useFormikContext<IConfigurableSubscriptionOrder>();
  const { t } = useTranslation();

  const handleChangeUnlockOverrides = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      if (!e.target.checked) {
        try {
          setFieldValue(name, checked);
        } catch (errors) {
          setErrors(yupToFormErrors(errors));
        }
      } else {
        setFieldValue(name, checked);
      }
    },
    [setErrors, setFieldValue],
  );

  return (
    <Switch
      name="unlockOverrides"
      value={values.unlockOverrides}
      onChange={handleChangeUnlockOverrides}
    >
      {t(`${I18N_PATH}UnlockOverrides`)}
    </Switch>
  );
};
