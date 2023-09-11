import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormik, useFormikContext } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Protected, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';

import { INewSubscription } from '../../../../types';

import ServiceItem from './ServiceItem/ServiceItem';
import { getInitialValues } from './formikData';
import { applyProrationToCreateForm, sanitizePayload } from './helpers';
import { IReviewProrationFormData, IReviewProrationModal } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const ReviewProrationModal: React.FC<IReviewProrationModal> = ({
  isOpen,
  onClose,
  proration,
  subscriptionId,
}) => {
  const { t } = useTranslation();
  const { subscriptionStore } = useStores();

  const subscriptionFormik = useFormikContext<INewSubscription>();

  const initialValues = getInitialValues(proration);

  const handleSaveChanges = useCallback(() => {
    subscriptionFormik.setFieldValue('showProrationButton', false);
    subscriptionFormik.handleSubmit();
    onClose?.();
  }, [subscriptionFormik, onClose]);

  const handleSubmit = useCallback(
    async (values: IReviewProrationFormData) => {
      const payload = sanitizePayload(values, initialValues);

      if (subscriptionId) {
        const response = await subscriptionStore.reviewProration(subscriptionId, payload);

        if (response) {
          handleSaveChanges();
        }
      } else {
        applyProrationToCreateForm(payload, subscriptionFormik);
        handleSaveChanges();
      }
    },
    [handleSaveChanges, initialValues, subscriptionFormik, subscriptionId, subscriptionStore],
  );

  const formik = useFormik<IReviewProrationFormData>({
    initialValues,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
  });

  const { values } = formik;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Layouts.Box width="511px">
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="3" left="3" bottom="2">
            <Typography variant="headerThree" shade="dark">
              {t(`${I18N_PATH}ReviewProration`)}
            </Typography>
          </Layouts.Padding>
          <Divider />

          <FormContainer formik={formik} noValidate>
            <Layouts.Scroll maxHeight={600}>
              <Layouts.Padding left="3" right="3" top="2" bottom="2">
                <Layouts.Flex justifyContent="space-between">
                  <Layouts.Box width="190px">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}BillableItem`)}:
                    </Typography>
                  </Layouts.Box>
                  <Typography color="secondary" variant="bodyMedium">
                    {t(`${I18N_PATH}ProratedAmount`)}
                  </Typography>
                  <Protected permissions="subscriptions:change-prorated-amount:perform">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}NewAmount`)}
                    </Typography>
                  </Protected>
                </Layouts.Flex>
                <FieldArray name="serviceItems">
                  {() =>
                    values.serviceItems.map(
                      (serviceItem, index) =>
                        (serviceItem.isProrated || !isEmpty(serviceItem.lineItems)) && (
                          <ServiceItem key={serviceItem.id} index={index} {...serviceItem} />
                        ),
                    )
                  }
                </FieldArray>
              </Layouts.Padding>
            </Layouts.Scroll>
            <Divider />
            <Layouts.Padding padding="3">
              <Layouts.Flex justifyContent="space-between">
                <Button onClick={onClose}>{t('Text.Cancel')}</Button>
                <Protected
                  permissions="subscriptions:change-prorated-amount:perform"
                  fallback={
                    <Button variant="primary" onClick={handleSaveChanges}>
                      {t('Text.SaveChanges')}
                    </Button>
                  }
                >
                  <Button variant="primary" type="submit">
                    {t(`${I18N_PATH}ConfirmAndSave`)}
                  </Button>
                </Protected>
              </Layouts.Flex>
            </Layouts.Padding>
          </FormContainer>
        </Layouts.Flex>
      </Layouts.Box>
    </Modal>
  );
};

export default observer(ReviewProrationModal);
