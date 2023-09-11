import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';
import { ITruckAndDriverCost } from '@root/types';

import { getPayloadData } from './helpers/getPayloadData';
import { generateValidationSchema, getValues } from './formikData';
import TruckAndDriverQuickViewActions from './TruckAndDriverQuickViewActions';
import TruckAndDriverQuickViewRightPanel from './TruckAndDriverQuickViewRightPanel';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.';

const TruckAndDriverQuickViewContent: React.FC = () => {
  const { truckAndDriverCostStore, systemConfigurationStore, businessUnitStore } = useStores();
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedTruckAndDriverCosts = truckAndDriverCostStore.selectedEntity;
  const isDuplicating = systemConfigurationStore.isDuplicating;

  const handleTruckAndDriverCostsChange = useCallback(
    async (values: ITruckAndDriverCost, formikHelpers: FormikHelpers<ITruckAndDriverCost>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }
      const payloadData = getPayloadData(values);

      if (selectedTruckAndDriverCosts && !isDuplicating) {
        await truckAndDriverCostStore.update(payloadData);
      } else {
        await truckAndDriverCostStore.create(payloadData);
      }
      forceCloseQuickView();
    },

    [selectedTruckAndDriverCosts, isDuplicating, forceCloseQuickView, truckAndDriverCostStore],
  );

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, `${I18N_PATH}ValidationErrors.`),
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues(selectedTruckAndDriverCosts),
    onSubmit: handleTruckAndDriverCostsChange,
  });

  const businessUnitOptions: ISelectOption[] = useMemo(() => {
    const businessUnitAllOption = { value: 0, label: t('Text.AllBusinessUnits') };
    const buOpt = businessUnitStore.values.map(elem => ({
      value: elem.id,
      label: elem.nameLine1,
    }));

    return [businessUnitAllOption, ...buOpt];
  }, [businessUnitStore.values, t]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={
          <TruckAndDriverQuickViewRightPanel businessUnitOptions={businessUnitOptions} />
        }
        actionsElement={
          <TruckAndDriverQuickViewActions businessUnitOptions={businessUnitOptions} />
        }
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(TruckAndDriverQuickViewContent);
