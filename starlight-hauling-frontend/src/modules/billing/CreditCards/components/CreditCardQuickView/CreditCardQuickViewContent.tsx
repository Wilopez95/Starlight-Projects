/* eslint-disable no-negated-condition */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useState } from 'react';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik, validateYupSchema, yupToFormErrors } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';
import { useIntl } from '@root/i18n/useIntl';

import { FormContainer } from '../../../../../components';
import { formatCreditCard } from '../../../../../helpers';
import { useScrollOnError, useStores } from '../../../../../hooks';
import { sanitizeCreditCard } from '../../store/sanitize';
import { type ICreditCard, type INewCreditCard } from '../../types';

import tableQuickViewStyles from '../../../../../common/TableTools/TableQuickView/css/styles.scss';
import { getValidationSchema, getValues } from './formikData';
import { CardInformation, JobSiteAssignment } from './tabs';
import { ICreditCardQuickView } from './types';

const navigationConfig: NavigationConfigItem[] = [
  { label: 'Card Information', key: '0', index: 0 },
  { label: 'Assign to Job Site', key: '1', index: 1 },
];

const tabs = [CardInformation, JobSiteAssignment];

const CreditCardQuickViewContent: React.FC<ICreditCardQuickView> = ({ viewMode }) => {
  const { creditCardStore, customerStore } = useStores();
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(navigationConfig[0]);
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const intl = useIntl();

  const Component = tabs[currentTab.index];

  const selectedCreditCard = creditCardStore.selectedEntity;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const customer = customerStore.selectedEntity!;
  const isNew = !selectedCreditCard;

  const currentSchema = getValidationSchema(isNew, intl)[currentTab.index];

  const formik = useFormik<INewCreditCard>({
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedCreditCard, customer),
    onSubmit: noop,
  });

  const { values, errors, isValidating, setErrors } = formik;

  useScrollOnError(errors, !isValidating);

  const handleChangeCC = useCallback(
    async (doc: INewCreditCard | ICreditCard) => {
      if (viewMode) {
        closeQuickView();

        return;
      }

      if (doc.id === 0) {
        await creditCardStore.create(
          sanitizeCreditCard(doc as INewCreditCard) as unknown as ICreditCard,
        );
      } else {
        //@ts-expect-error
        delete doc.cardNumber;
        //@ts-expect-error
        delete doc.cvv;
        //@ts-expect-error
        delete doc.isAutopay;

        await creditCardStore.update(doc as ICreditCard);
      }

      forceCloseQuickView();
    },
    [creditCardStore, viewMode, forceCloseQuickView, closeQuickView],
  );

  const validateTab = useCallback(
    async (action: 'back' | 'next' | 'submit', formValues: INewCreditCard) => {
      const currentTabIndex = currentTab.index;
      try {
        if (action !== 'back') {
          await validateYupSchema(formValues, currentSchema);
          currentTabIndex === navigationConfig.length - 1 || action === 'submit'
            ? handleChangeCC(formValues)
            : setCurrentTab(navigationConfig[currentTabIndex + 1]);
        } else {
          currentTabIndex === 0
            ? closeQuickView()
            : setCurrentTab(navigationConfig[currentTabIndex - 1]);
        }
        setErrors({});
      } catch (err) {
        setErrors(yupToFormErrors(err));
      }
    },
    [currentTab.index, currentSchema, handleChangeCC, setErrors, closeQuickView],
  );

  const handleNavigationChange = useCallback(
    async (tab: NavigationConfigItem) => {
      const index = tab.index;

      if (currentTab.index === index) {
        return;
      }

      try {
        await validateYupSchema(values, currentSchema);

        setCurrentTab(tab);
      } catch (error: unknown) {
        setErrors(yupToFormErrors(error));
      }
    },
    [currentSchema, currentTab.index, setErrors, values],
  );

  const title = isNew ? 'Create New Credit Card' : formatCreditCard(values);

  return (
    <QuickViewContent
      dirty={formik.dirty}
      confirmModal={<QuickViewConfirmModal />}
      rightPanelElement={
        <>
          <Layouts.Padding padding="3">
            <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
            <Navigation
              activeTab={currentTab}
              configs={navigationConfig}
              onChange={handleNavigationChange}
              progressBar
            />
          </Layouts.Padding>

          <Layouts.Scroll rounded>
            <Layouts.Padding padding="3">
              <FormContainer formik={formik}>
                <Component viewMode={!!viewMode} isNew={isNew} />
              </FormContainer>
            </Layouts.Padding>
          </Layouts.Scroll>
        </>
      }
      actionsElement={
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={!isNew || viewMode ? closeQuickView : () => validateTab('back', values)}>
            {currentTab.index === 0 || !isNew ? 'Cancel' : '← Back'}
          </Button>
          {isNew ? (
            <Button disabled={creditCardStore.loading} onClick={() => validateTab('next', values)}>
              {currentTab.index + 1 === navigationConfig.length
                ? 'Add New Card'
                : `${navigationConfig[currentTab.index + 1].label as string} →`}
            </Button>
          ) : (
            <Button
              disabled={creditCardStore.loading}
              variant="primary"
              onClick={() => validateTab('submit', values)}
            >
              Save Changes
            </Button>
          )}
        </Layouts.Flex>
      }
    />
  );
};

export default observer(CreditCardQuickViewContent);
