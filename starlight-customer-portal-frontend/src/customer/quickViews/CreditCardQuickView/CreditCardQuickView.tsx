import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainer,
  NavigationConfigItem,
  Layouts,
} from '@starlightpro/shared-components';
import { useFormik, validateYupSchema, yupToFormErrors } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CrossIcon } from '@root/assets';
import { Divider, TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useScrollOnError, useStores } from '@root/core/hooks';
import type { INewCreditCard } from '@root/core/types';
import { formatCreditCard } from '@root/finance/helpers';
import { sanitizeCreditCard } from '@root/finance/stores/creditCard/sanitize';

import { IQuickView } from '../types';

import { getValidationSchema, getValues } from './formikData';
import { AddButton, ButtonContainer } from './styles';
import { CardInformation } from './tabs';

const I18N_PATH = 'quickViews.creditCardQuickView.';

const tabs = [CardInformation];

const CreditCardQuickView: React.FC<IQuickView> = ({
  tableContainerRef,
  clickOutContainers,
  viewMode,
}) => {
  const { creditCardStore, customerStore } = useStores();
  const { t } = useTranslation();
  const navigationConfig: NavigationConfigItem[] = useMemo(
    () => [{ label: t(`${I18N_PATH}cardInformation`), key: '0', index: 0 }],
    [t],
  );

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(navigationConfig[0]);

  const Component = tabs[currentTab.index];

  const selectedCreditCard = creditCardStore.selectedEntity;
  const customer = customerStore.selectedEntity!;
  const isNew = !selectedCreditCard;

  const currentSchema = getValidationSchema(isNew)[currentTab.index];

  const formik = useFormik({
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedCreditCard, customer),
    onSubmit: noop,
  });

  const { values, errors, isValidating, setErrors } = formik;

  useScrollOnError(errors, !isValidating);

  const handleChangeCC = useCallback(
    (doc: INewCreditCard, onCancel: () => void) => {
      if (viewMode) {
        onCancel();

        return;
      }

      if (doc.id === 0) {
        creditCardStore.create(sanitizeCreditCard(doc) as any);
      } else {
        delete doc.cardNumber;
        delete doc.cvv;

        creditCardStore.update(doc as any);
      }

      onCancel();
    },
    [creditCardStore, viewMode],
  );

  const validateTab = useCallback(
    async (action: 'back' | 'next' | 'submit', onCancel: () => void) => {
      const currentTabIndex = currentTab.index;

      try {
        if (action !== 'back') {
          await validateYupSchema(values, currentSchema);
          currentTabIndex === navigationConfig.length - 1 || action === 'submit'
            ? handleChangeCC(values, onCancel)
            : setCurrentTab(navigationConfig[currentTabIndex + 1]);
        } else {
          currentTabIndex === 0 ? onCancel() : setCurrentTab(navigationConfig[currentTabIndex - 1]);
        }
        setErrors({});
      } catch (errors) {
        setErrors(yupToFormErrors(errors));
      }
    },
    [currentTab.index, values, currentSchema, handleChangeCC, setErrors, navigationConfig],
  );

  const title = isNew ? t(`${I18N_PATH}newCreditCard`) : formatCreditCard(values);

  return (
    <TableQuickView
      parentRef={tableContainerRef}
      clickOutContainers={[...(clickOutContainers ?? []), tableContainerRef]}
      store={creditCardStore}
      size='half'
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => (
        <>
          <div ref={onAddRef} className={tableQuickViewStyles.header}>
            <Layouts.Box
              top='7px'
              right='15px'
              position='absolute'
              className={tableQuickViewStyles.cancelButton}
            >
              <CrossIcon onClick={onCancel} />
            </Layouts.Box>
            <div className={tableQuickViewStyles.dataContainer}>
              <div className={tableQuickViewStyles.quickViewTitle}>{title}</div>
            </div>
          </div>
          <Layouts.Scroll height={scrollContainerHeight} rounded>
            <Layouts.Padding padding='3'>
              <FormContainer formik={formik}>
                <Component viewMode={!!viewMode} isNew={isNew} />
              </FormContainer>
            </Layouts.Padding>
          </Layouts.Scroll>
          <div ref={onAddRef} className={tableQuickViewStyles.buttonContainer}>
            <Divider bottom />
            <ButtonContainer>
              <Button onClick={!isNew || viewMode ? onCancel : () => validateTab('back', onCancel)}>
                {currentTab.index === 0 || !isNew ? 'Cancel' : '← Back'}
              </Button>
              {isNew ? (
                <AddButton onClick={() => validateTab('next', onCancel)} variant='converseSuccess'>
                  {currentTab.index + 1 === navigationConfig.length
                    ? 'Add New Card'
                    : `${navigationConfig[currentTab.index + 1].label as string} →`}
                </AddButton>
              ) : (
                <Button variant='primary' onClick={() => validateTab('submit', onCancel)}>
                  Save Changes
                </Button>
              )}
            </ButtonContainer>
          </div>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(CreditCardQuickView));
