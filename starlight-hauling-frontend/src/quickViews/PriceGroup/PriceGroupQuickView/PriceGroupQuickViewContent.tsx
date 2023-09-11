import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { capitalize, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewContent, Typography, useQuickViewContext } from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { PriceGroupForm } from '@root/components/forms';
import {
  getPriceGroupValidationSchema,
  getPriceGroupValues,
} from '@root/components/forms/PriceGroup/formikData';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import styles from '../css/styles.scss';

const PriceGroupQuickViewContent: React.FC = () => {
  const { priceGroupStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { closeQuickView } = useQuickViewContext();
  const intl = useIntl();

  const selectedPriceGroup = priceGroupStore.selectedEntity!;

  const handleOpenRates = useCallback(() => {
    priceGroupStore.toggleRatesQuickView();
  }, [priceGroupStore]);

  const formik = useFormik({
    validationSchema: getPriceGroupValidationSchema(priceGroupStore),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: getPriceGroupValues(
      { businessUnitId, businessLineId },
      'jobSites',
      intl,
      selectedPriceGroup,
    ),
    initialErrors: {},
    onSubmit: noop,
  });
  const { values } = formik;

  return (
    <QuickViewContent
      rightPanelElement={
        <>
          <Layouts.Padding padding="3">
            <div className={tableQuickViewStyles.quickViewTitle}>
              {capitalize(values.description)}
            </div>
            <div className={styles.subtitle}>
              <div className={tableQuickViewStyles.quickViewDescription}>Specific Price</div>
              <Typography color="information" onClick={handleOpenRates}>
                View Rack Rates
              </Typography>
            </div>
          </Layouts.Padding>

          <Divider />

          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              <FormContainer formik={formik} className={styles.formContainer}>
                <PriceGroupForm viewMode />
              </FormContainer>
            </Layouts.Padding>
          </Layouts.Scroll>
        </>
      }
      actionsElement={
        <Button variant="primary" onClick={closeQuickView} className={styles.closeButton}>
          Close
        </Button>
      }
    />
  );
};

export default observer(PriceGroupQuickViewContent);
