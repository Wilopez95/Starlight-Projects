import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Subsection, Typography } from '@root/common';
import MaterialSelect from '@root/components/MaterialSelect/MaterialSelect';
import ServiceSelect from '@root/components/ServiceSelect/ServiceSelect';
import { useStores } from '@root/hooks';
import { useIsScheduledOrInProgress } from '@root/quickViews/SubscriptionOrderEdit/hooks';
import { IConfigurableSubscriptionOrder } from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.Service.';

const Service: React.FC = () => {
  const { subscriptionStore, subscriptionOrderStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const { values, errors, setFieldValue, handleChange } =
    useFormikContext<IConfigurableSubscriptionOrder>();

  const { t } = useTranslation();

  const oneTime = subscriptionOrderStore?.selectedEntity?.oneTime;
  const material = subscriptionOrderStore?.selectedEntity?.subscriptionServiceItem?.material;
  const isScheduledOrInProgress = useIsScheduledOrInProgress();

  useEffect(() => {
    if ((!values.materialId || values.materialId !== material?.originalId) && material) {
      setFieldValue('materialId', material.originalId);
    }
  }, [material, setFieldValue, values.materialId]);

  return (
    <Subsection gray>
      <Layouts.Flex justifyContent="space-between">
        <Typography variant="headerThree">{t(`${I18N_PATH}Service`)}</Typography>
      </Layouts.Flex>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Column>
          <Layouts.Box width="424px">
            <ServiceSelect
              name="billableServiceId"
              label={t(`${I18N_PATH}Service`)}
              value={values.billableServiceId}
              error={errors.billableServiceId}
              placeholder={t(`${I18N_PATH}SelectService`)}
              onSelectChange={setFieldValue}
              oneTime={oneTime}
              disabled
              businessLineId={subscription?.businessLine.id}
            />
          </Layouts.Box>
        </Layouts.Column>
        <Layouts.Column>
          <Layouts.Flex justifyContent="flex-end">
            <Layouts.Box width="160px">
              <Layouts.Box width="75px">
                <FormInput
                  label={t(`${I18N_PATH}QTY`)}
                  name="quantity"
                  type="number"
                  countable
                  limits={{
                    min: 1,
                    max: 100,
                  }}
                  value={values.quantity}
                  error={errors.quantity}
                  onChange={handleChange}
                  disabled={!oneTime || !isScheduledOrInProgress}
                />
              </Layouts.Box>
            </Layouts.Box>
          </Layouts.Flex>
        </Layouts.Column>
      </Layouts.Flex>
      <Layouts.Box width="424px">
        <MaterialSelect
          name="materialId"
          businessLineId={subscription?.businessLine.id}
          label={t(`${I18N_PATH}Material`)}
          placeholder={t(`${I18N_PATH}SelectMaterial`)}
          value={values.materialId ?? ''}
          error={errors.materialId}
          disabled
        />
      </Layouts.Box>
    </Subsection>
  );
};

export default observer(Service);
