import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  Protected,
  QuickViewContent,
  Typography,
  useQuickViewContext,
} from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { FormContainer } from '../../../../../components';
import { PromptModal } from '../../../../../components/modals';
import { useBoolean, useBusinessContext, useStores } from '../../../../../hooks';
import { StatementService } from '../../../Statements/api/statement';
import SendStatementsModal from '../SendStatementsModal/SendStatements';

import BatchStatementForm from './BatchStatementForm/BatchStatement';
import { getValues, validationSchema } from './formikData';
import { IBatchStatementQuickView } from './types';

const I18N_PATH = 'quickViews.BatchStatement.BatchStatementQuickView.BatchStatementQuickView.';

const BatchStatementQuickViewContent: React.FC<IBatchStatementQuickView> = ({
  onFinanceChargeQuickViewOpen,
  setGenerationJob,
  showSummaryModal,
  loading,
  setLoading,
  stopCheckingJobResult,
}) => {
  const { closeQuickView } = useQuickViewContext();
  const { customerStore, batchStatementStore, statementStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [isEmptyStatementsModalOpen, showEmptyStatementsModal, hideEmptyStatementsModal] =
    useBoolean();
  const [isSendStatementsModalOpen, openSendStatementsModal, hideSendStatementsModal] =
    useBoolean();

  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const isNew = !id;
  const selectedBatchStatement = batchStatementStore.selectedEntity;

  const formik = useFormik({
    validationSchema,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues(selectedBatchStatement),
    onSubmit: noop,
  });

  const { validateForm, values } = formik;

  const checkedStatementsNumber = values.statementIds?.length ?? 0;
  const processAll =
    checkedStatementsNumber === 0 ||
    checkedStatementsNumber === batchStatementStore?.selectedEntity?.statements?.length;

  const selectedStatementsIds = useMemo(() => {
    const ids = values.statementIds?.length
      ? values.statementIds?.map(idNum1 => `id=${idNum1}`).join('&')
      : batchStatementStore?.selectedEntity?.statements
          ?.map(({ id: idNum2 }) => `id=${idNum2}`)
          .join('&');

    return ids;
  }, [batchStatementStore?.selectedEntity?.statements, values.statementIds]);

  const handleStatementDownload = useCallback(() => {
    if (selectedStatementsIds) {
      StatementService.downloadStatements(selectedStatementsIds);
    }
  }, [selectedStatementsIds]);

  useEffect(() => {
    (async () => {
      if (id) {
        await batchStatementStore.requestDetailed(+id);
      }
    })();
  }, [id, batchStatementStore]);

  const handleCreate = useCallback(
    async valuesData => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      const generationJobId = await batchStatementStore.create({
        statementDate: valuesData.statementDate,
        endDate: valuesData.endDate,
        businessUnitId,
        customerIds: customerStore.checkedCustomers.map(({ id: idNum }) => idNum),
      });

      if (generationJobId) {
        setLoading(true);
        showSummaryModal();
        setGenerationJob(generationJobId);
      } else {
        showEmptyStatementsModal();
        setLoading(false);
      }
    },
    [
      batchStatementStore,
      businessUnitId,
      customerStore.checkedCustomers,
      showEmptyStatementsModal,
      showSummaryModal,
      validateForm,
      setLoading,
      setGenerationJob,
    ],
  );

  useEffect(() => () => stopCheckingJobResult(), [stopCheckingJobResult]);

  const handleSendStatementsFormSubmit = useCallback(
    (emails?: { statementEmails: string[] }) => {
      const ids = values.statementIds?.length
        ? values.statementIds?.map(idNum => idNum)
        : batchStatementStore?.selectedEntity?.statements?.map(({ id: idNum }) => idNum);

      if (ids) {
        statementStore.sendStatements(ids, emails?.statementEmails);
      }
      hideSendStatementsModal();
    },
    [
      batchStatementStore?.selectedEntity?.statements,
      hideSendStatementsModal,
      statementStore,
      values.statementIds,
    ],
  );

  const handleSendStatements = useCallback(() => {
    if (checkedStatementsNumber === 1) {
      const statementId = values.statementIds?.[0];
      const statement = selectedBatchStatement?.statements?.find(
        ({ id: idNum }) => +idNum === statementId,
      );

      if (statement?.customer?.id) {
        customerStore.requestById(statement?.customer?.id);
      }
      openSendStatementsModal();
    } else {
      handleSendStatementsFormSubmit();
    }
  }, [
    checkedStatementsNumber,
    customerStore,
    handleSendStatementsFormSubmit,
    openSendStatementsModal,
    selectedBatchStatement?.statements,
    values.statementIds,
  ]);

  const handleFinanceCharges = useCallback(() => {
    if (values.statementIds?.length) {
      onFinanceChargeQuickViewOpen(values.statementIds);
    }
  }, [onFinanceChargeQuickViewOpen, values.statementIds]);

  return (
    <FormContainer formik={formik}>
      <SendStatementsModal
        isOpen={isSendStatementsModalOpen}
        onClose={hideSendStatementsModal}
        onFormSubmit={handleSendStatementsFormSubmit}
      />

      <PromptModal
        isOpen={isEmptyStatementsModalOpen}
        submitButton={t(`${I18N_PATH}Close`)}
        title={t(`${I18N_PATH}EmptyStatements`)}
        subTitle={t(`${I18N_PATH}NoStatementsMessage`)}
        onSubmit={hideEmptyStatementsModal}
      />
      <QuickViewContent
        rightPanelElement={
          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              <Typography variant="headerThree">
                {isNew
                  ? t(`${I18N_PATH}CreateBatchStatement`)
                  : t(`${I18N_PATH}BatchStatementDetails`)}
              </Typography>
              <Divider both />
              <BatchStatementForm viewMode={!isNew} />
            </Layouts.Padding>
          </Layouts.Scroll>
        }
        actionsElement={
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={closeQuickView}>
              {isNew ? t(`${I18N_PATH}Cancel`) : t(`${I18N_PATH}Close`)}
            </Button>

            <Layouts.Flex justifyContent="flex-end">
              {isNew ? (
                <Button
                  variant="success"
                  disabled={loading || customerStore.checkedCustomers.length < 1}
                  onClick={() => handleCreate(values)}
                >
                  {t(`${I18N_PATH}CreateBatchStatement`)}
                </Button>
              ) : (
                <>
                  <Layouts.Margin right="2">
                    <Button onClick={handleStatementDownload}>
                      {t(`${I18N_PATH}Download`)} {processAll ? 'All' : null}
                    </Button>
                  </Layouts.Margin>
                  <Layouts.Margin right="2">
                    <Button onClick={handleSendStatements}>
                      {t(`${I18N_PATH}Send`)} {processAll ? 'All' : null}
                    </Button>
                  </Layouts.Margin>
                  <Protected permissions="billing:finance-charges:full-access">
                    <Button
                      disabled={values.statementIds?.length === 0}
                      variant="primary"
                      onClick={handleFinanceCharges}
                    >
                      {t(`${I18N_PATH}FinanceCharges`)}
                    </Button>
                  </Protected>
                </>
              )}
            </Layouts.Flex>
          </Layouts.Flex>
        }
      />
    </FormContainer>
  );
};

export default observer(BatchStatementQuickViewContent);
