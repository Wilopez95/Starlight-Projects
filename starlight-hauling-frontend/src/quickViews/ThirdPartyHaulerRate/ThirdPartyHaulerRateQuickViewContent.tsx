import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, NavigationConfigItem } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';

import { generateValidationSchema, getValues, IThirdPartyHaulerCostsFormData } from './formikData';
import ThirdPartyHaulerRateQuickViewActions from './ThirdPartyHaulerRateQuickViewActions';
import ThirdPartyHaulerRateQuickViewRightPanel from './ThirdPartyHaulerRateQuickViewRightPanel';

const I18N_PATH =
  'pages.SystemConfiguration.tables.ThirdPartyHaulerCosts.QuickView.ValidationErrors.';

const ThirdPartyHaulerRateQuickViewContent: React.FC = () => {
  const {
    thirdPartyHaulerStore,
    businessLineStore,

    billableServiceStore,
  } = useStores();
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();
  const thirdPartyHauler = thirdPartyHaulerStore.selectedEntity;

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem | undefined
  >();

  const [currentEquipmentItemNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

  const businessLinesOptions: ISelectOption[] = businessLineStore.sortedValues.reduce(
    (acc: ISelectOption[], businessLine) => {
      if (!businessLine.active) {
        return acc;
      }

      return [...acc, { label: businessLine.name, value: businessLine.id }];
    },
    [],
  );

  const [businessLineId, setBusinessLineId] = useState<number>(+businessLinesOptions[0].value);

  const handleBusinessLineIdChange = useCallback(
    (_: string, value: number) => {
      setMaterialNavigation(undefined);
      setEquipmentItemNavigation(undefined);
      setBusinessLineId(value);
    },
    [setMaterialNavigation, setEquipmentItemNavigation],
  );

  const handleThirdPartyHaulerCostsUpdate = useCallback(
    async (
      values: IThirdPartyHaulerCostsFormData,
      formikHelpers: FormikHelpers<IThirdPartyHaulerCostsFormData>,
    ) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (thirdPartyHauler) {
        thirdPartyHaulerStore.updateThirdPartyHaulerCosts(
          thirdPartyHauler.id,
          values.thirdPartyHaulerCosts,
        );
      }

      forceCloseQuickView();
    },
    [thirdPartyHauler, forceCloseQuickView, thirdPartyHaulerStore],
  );

  const costs = useMemo(
    () =>
      thirdPartyHaulerStore.thirdPartyHaulerCosts.filter(cost => {
        const parsedMaterialId = currentMaterialNavigation?.key
          ? +currentMaterialNavigation.key
          : null;

        return cost.materialId === parsedMaterialId;
      }),
    [currentMaterialNavigation?.key, thirdPartyHaulerStore.thirdPartyHaulerCosts],
  );

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, I18N_PATH),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues({
      billableServices: billableServiceStore.sortedValues,
      items: costs,
      businessLineId,
      materialId: currentMaterialNavigation?.key ?? null,
    }),
    onSubmit: handleThirdPartyHaulerCostsUpdate,
  });

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <ThirdPartyHaulerRateQuickViewRightPanel
            businessLineId={businessLineId}
            businessLineOptions={businessLinesOptions}
            onChangeBusinessLineId={handleBusinessLineIdChange}
            onChangeEquipmentNavigation={setEquipmentItemNavigation}
            onChangeMaterialNavigation={setMaterialNavigation}
            currentEquipmentItemNavigation={currentEquipmentItemNavigation}
            currentMaterialNavigation={currentMaterialNavigation}
          />
        }
        actionsElement={<ThirdPartyHaulerRateQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(ThirdPartyHaulerRateQuickViewContent);
