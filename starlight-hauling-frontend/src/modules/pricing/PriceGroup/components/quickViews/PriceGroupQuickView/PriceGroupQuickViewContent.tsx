import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { capitalize, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewContent, Typography, useQuickViewContext } from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import {
  getPriceGroupValidationSchema,
  getPriceGroupValues,
} from '../components/PriceGroupForm/formikData';
import PriceGroupForm from '../components/PriceGroupForm/PriceGroupForm';

import styles from './css/styles.scss';

const I18N_PATH = 'modules.pricing.PriceGroup.components.quickViews.PriceGroupQuickView.Text.';

const PriceGroupQuickViewContent: React.FC = () => {
  const { priceGroupStoreNew, customRateStoreNew } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { closeQuickView } = useQuickViewContext();
  const intl = useIntl();
  const { t } = useTranslation();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity!;

  const handleOpenRates = useCallback(() => {
    customRateStoreNew.toggleRatesQuickView();
  }, [customRateStoreNew]);

  const formik = useFormik({
    validationSchema: getPriceGroupValidationSchema(priceGroupStoreNew),
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
              <div className={tableQuickViewStyles.quickViewDescription}>
                {t(`${I18N_PATH}SpecificPrice`)}
              </div>
              <Typography color="information" onClick={handleOpenRates}>
                {t(`${I18N_PATH}ViewRackRates`)}
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
          {t('Text.Close')}
        </Button>
      }
    />
  );
};

export default observer(PriceGroupQuickViewContent);
