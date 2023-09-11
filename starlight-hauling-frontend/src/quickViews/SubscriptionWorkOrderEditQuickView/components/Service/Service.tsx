import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Subsection, Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.Service.';

const Service: React.FC = () => {
  const { billableServiceStore, materialStore } = useStores();
  const { values, setFieldValue, handleChange } =
    useFormikContext<IConfigurableSubscriptionWorkOrder>();

  useEffect(() => {
    if (values.equipmentItemId) {
      materialStore.cleanup();
      materialStore.requestByEquipmentItem(values.equipmentItemId, {
        activeOnly: false,
        rollOffOnly: false,
      });
    }
  }, [materialStore, values.equipmentItemId]);

  const { t } = useTranslation();

  const billableServiceOptions = useMemo(() => {
    const billableServices = billableServiceStore.filteredServices.length
      ? billableServiceStore.filteredServices
      : billableServiceStore.sortedValues;

    return billableServices
      .filter(service => !service.oneTime)
      .map(billableService => ({
        label: billableService.description,
        value: billableService.id,
        hint: billableService.equipmentItem?.shortDescription,
        COEHint: billableService.equipmentItem?.customerOwned,
        billingCycles: billableService.billingCycles,
      }));
  }, [billableServiceStore.filteredServices, billableServiceStore.sortedValues]);

  const materialOptions: ISelectOption[] = materialStore.sortedValues.map(material => ({
    label: material.description,
    value: material.id,
  }));

  return (
    <Subsection gray>
      <Layouts.Flex justifyContent="space-between">
        <Typography variant="headerThree">{t(`${I18N_PATH}Service`)}</Typography>
      </Layouts.Flex>
      <Layouts.Flex justifyContent="flex-end">
        <Layouts.Column>
          <Layouts.Box width="424px">
            <Select
              label={t(`${I18N_PATH}Service`)}
              placeholder={t(`${I18N_PATH}Service`)}
              name="billableServiceId"
              disabled
              value={values.billableServiceId}
              onSelectChange={noop}
              options={billableServiceOptions}
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
                  onChange={handleChange}
                  disabled
                />
              </Layouts.Box>
            </Layouts.Box>
          </Layouts.Flex>
        </Layouts.Column>
      </Layouts.Flex>
      <Layouts.Box width="424px">
        <Select
          label={t(`${I18N_PATH}Material`)}
          name="materialId"
          key="materialId"
          options={materialOptions}
          value={values.subscriptionServiceItem?.materialId}
          onSelectChange={setFieldValue}
          disabled
        />
      </Layouts.Box>
    </Subsection>
  );
};

export default observer(Service);
